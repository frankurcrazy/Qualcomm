# NOTE: This script must be run with Perl in a command box,
# i.e.  Perl CDMAAccessProbes.pl <ISF File Name> [Excel File Name]

# This example demonstrates the usage of DM core automation
# interface and excel automation interface to plot
# CDMA access probes histogram

use strict;
use File::Spec;
use Win32::OLE;
use File::Basename;
use Cwd 'abs_path';
use Win32::OLE::Const 'Microsoft Excel';

#  Miscellaneous constants
use constant false     => 0;
use constant true      => 1;

use constant MIN_COUNT => 0;
use constant MAX_COUNT => 10;

# Global variables
my $IISF               = 0;
my $gSamples           = 0;
my $gLastCount         = 0;
my @gProbeCount        = [];
my $gTotalProbes       = 0;
my $gFirstPacket       = false;

# ISF/Excel fully qualified paths
my $ISFAbsolutePath    = "";
my $XLSAbsolutePath    = "";

# Get path from current script file name
sub GetPathFromScript
{
   # Assume failure
   my $Path = "";
   my $Txt = "";

   $Path = abs_path( $ENV{'PWD'} );
   $Path = File::Spec->rel2abs( $Path ) ;
   if (length $Path <= 0)
   {
      $Txt = "Unable to get folder name";
      print "\n$Txt\n";
   }
   else
   {
      if (!($Path =~ /\\$/))
      {
         $Path .= "\\";
      }
   }

   return $Path;
}

# Process the argument - ISF file name
sub ParseArguments
{
   # Assume failure
   my $RC = false;
   my $Txt = "";
   my $Help =
      "Syntax: Perl CDMAAccessProbes.pl <ISF File Name> [Excel File Name]\n"
    . "Eg:     Perl CDMAAccessProbes.pl \"Access Probes.isf\" \"Access Probes.xls\"\n";

   if ($#ARGV < 0)
   {
      print "\n$Help\n";
      return $RC;
   }

   my $ISFFileName = $ARGV[0];
   if ($ISFFileName eq "")
   {
      $Txt = "Invalid ISF file name\n\n" . $Help;
      print "\n$Txt";

      return $RC;
   }

   $ISFAbsolutePath = GetPathFromScript();
   if ($ISFAbsolutePath eq "")
   {
      $Txt = "Invalid ISF file name\n\n" . $Help;
      print "\n$Txt";

      return $RC;
   }
   else
   {
      $ISFAbsolutePath .= $ISFFileName;
   }

   if ($#ARGV == 1)
   {
      my $XLSFileName = $ARGV[1];
      if ($XLSFileName eq "")
      {
         $Txt = "Invalid Excel file name\n\n" . $Help;
         print "\n$Txt";

         return $RC;
      }
      else
      {
         if ($XLSFileName =~ /\\/)
         {
            print "\nhere\n";
            $XLSAbsolutePath = $XLSFileName . ".xls";
         }
         else
         {
            $XLSAbsolutePath = dirname( $ISFAbsolutePath );
            $XLSAbsolutePath .= "\\" . $XLSFileName . ".xls";
         }
      }
   }
   else
   {
      # Generate Excel file name from ISF file name
      $XLSAbsolutePath = $ISFAbsolutePath . ".xls";
   }

   # Success
   $RC = true;
   return $RC;
}

# Initialize application
sub Initialize
{
   # Assume failure
   my $RC = false;
   my $Txt = "";

   # Create the item store file interface
  $IISF = new Win32::OLE 'DMCoreAutomation.ItemStoreFiles';
   if (!$IISF)
   {
      print "\nUnable to obtain ISF interface";
      return $RC;
   }

   # Success
   $RC = true;
   return $RC;
}

# Perform analysis (obtain access probe data from ISF file)
sub Analyze
{
   # Assume failure
   my $RC  = false;
   my $Txt = "";

   $Txt = "Loading ISF file:\n" . $ISFAbsolutePath;
   print "\n$Txt";

   # Load the item store file
   my $Handle = $IISF->LoadItemStore( $ISFAbsolutePath );
   if ($Handle == 0xFFFFFFFF)
   {
      $Txt = "Unable to load ISF:\n" . $ISFAbsolutePath;
      print "\n$Txt\n";

      return $RC;
   }

   my $IClient = $IISF->GetClientInterface( $Handle );
   if (!$IClient)
   {
      $Txt = "Unable to obtain ISF client interface";
      print "\n$Txt";

      $IISF->CloseItemStore( $Handle );
      return $RC;
   }

   my $ClientHandle = $IClient->RegisterClient( true );
   if ($ClientHandle == 0xFFFFFFFF)
   {
      $Txt = "Unable to register ISF client";
      print "\n$Txt";

      $IISF->CloseItemStore( $Handle );
      return $RC;
   }

   my $IConfig = $IClient->ConfigureClient( $ClientHandle );
   if (!$IConfig)
   {
      $Txt = "Unable to configure ISF client";
      print "\n$Txt";

      $IClient->UnregisterClient( $ClientHandle );
      $IISF->CloseItemStore( $Handle );
      return $RC;
   }

   $Txt = "Processing ISF file...";
   print "\n$Txt";

   # Configure the client for supported log keys
   $IConfig->AddLog( 0x1013 );
   $IConfig->AddLog( 0x10BD );
   $IConfig->CommitConfig();

   # Populate the client with all instances of supported logs
   $IClient->PopulateClients();

   # Success/any items found?
   my $ItemCount = $IClient->GetClientItemCount( $ClientHandle );
   if ($ItemCount == 0)
   {
      $Txt = "Unable to find required data for processing";
      print "\n$Txt";

      $IClient->UnregisterClient( $ClientHandle );
      $IISF->CloseItemStore( $Handle );
      return $RC;
   }

   # Initialize array
   for (my $r = MIN_COUNT; $r <= MAX_COUNT + 1; $r += 1)
   {
      $gProbeCount[$r] = 0;
   }

   # Initialize array of log keys to field offsets
   my %Offsets = ();
   $Offsets{"[0x1013]"} = 0;
   $Offsets{"[0x10BD]"} = 2;

   # Process all items in the client
   for (my $ItemIndex = 0; $ItemIndex < $ItemCount; $ItemIndex++)
   {
      my $Item = $IClient->GetClientItem( $ClientHandle, $ItemIndex );
      if (!$Item)
      {
         next;
      }

      my $Fields = $Item->GetConfiguredItemFields( "", false, false );
      if (!$Fields)
      {
         next;
      }

      my $FieldCount = $Fields->GetFieldCount();
      if ($FieldCount < 9)
      {
         next;
      }

      my $ItemKey = $Item->GetItemKeyText();

      my $FI = $Offsets{$ItemKey};
      my $SequenceNumber = $Fields->GetFieldValue( $FI );
      my $ProbeNumber = $Fields->GetFieldValue( $FI + 1 );
      if ($SequenceNumber == 1 && $ProbeNumber == 1)
      {
         if (!$gFirstPacket)
         {
            $gLastCount = 1;
            $gFirstPacket = true;
            next;
         }

         $gSamples++;
         $gTotalProbes = $gLastCount;
         $gLastCount = 1;
      }
      else
      {
         ++$gLastCount;
         next;
      }

      if ($gTotalProbes > MAX_COUNT)
      {
         $gProbeCount[MAX_COUNT + 1] += 1;
      }
      else
      {
         $gProbeCount[$gTotalProbes] += 1;
      }
   }

   # An access probe data point is generated when a new sequence is detected
   # Because of this the last access probe (or sequence) is not accounted for
   # The last point is generated when it is determined that the log has been processed
   if ($gLastCount > 0 && $gFirstPacket)
   {
      $gSamples++;

      if ($gTotalProbes > MAX_COUNT)
      {
         $gProbeCount[MAX_COUNT + 1] += 1;
      }
      else
      {
         $gProbeCount[$gTotalProbes] += 1;
      }
   }

   $Txt = "Done";
   print "$Txt\n";

   if ($gSamples == 0)
   {
      $Txt = "Unable to find required data for processing";
      print "$Txt\n";

      return $RC;
   }

   $IClient->UnregisterClient( $ClientHandle );
   $IISF->CloseItemStore( $Handle );

   $RC = true;
   return $RC;
}

# Generate an Excel spreadsheet with the analysis results
sub GenerateExcelSpreadsheet
{
   # Assume failure
   my $RC  = false;
   my $Txt = "";

   # Start Excel and get automation object
   my $XL = new Win32::OLE 'Excel.Application';
   if (!$XL)
   {
      $Txt = "Error launching Excel";
      print "\n$Txt";

      return $RC;
   }

   # Get a new workbook
   my $WB = $XL->Workbooks->Add();
   if (!$WB)
   {
      $Txt = "Error interfacing to Excel";
      print "\n$Txt";

      return $RC;
   }

   $WB->Sheets( 3 )->Delete();
   $WB->Sheets( 2 )->Delete();

   $WB->{title} = "CDMA Access Probes";

   # Populate Excel workspace sheet
   my $Sheet = $WB->ActiveSheet;
   if (!$Sheet)
   {
      $Txt = "Error interfacing to Excel";
      print "\n$Txt";

      $WB->Close();
      return $RC;
   }

   $Sheet->{Name} = "Data";

   $Txt = "Generating Excel spreadsheet...";
   print "$Txt";

   # Populate Excel spreadsheet
   $RC = PopulateExcelSpreadsheet( $Sheet );
   if ($RC == false)
   {
      $Txt = "Error";
      print "\n$Txt";

      $WB->Close();
      return $RC; 
   }

   $Txt = "Done";
   print "$Txt\n";

   # Save the work book file
   $WB->SaveAs( $XLSAbsolutePath );
   $WB->Close();

   $Txt = "Excel file saved at:\n";
   $Txt .= $XLSAbsolutePath;
   print "$Txt\n";
}

# Populate Excel spreadsheet with analysis data
sub PopulateExcelSpreadsheet
{
   my $Sheet = shift;

   # Assume failure
   my $RC = false;

   $Sheet->Cells( 1, 1 )->{Value} = "Total Samples";
   $Sheet->Cells( 1, 1 )->Font->{Bold} = true;
   $Sheet->Cells( 1, 1 )->{ColumnWidth} = 14;
   $Sheet->Cells( 1, 2 )->{Value} = $gSamples;

   $Sheet->Cells( 2, 1 )->{Value} = "Probe Count";
   $Sheet->Cells( 2, 2 )->{Value} = "Probe Count Total";
   $Sheet->Cells( 2, 3 )->{Value} = "Probe Count %";

   $Sheet->Range( "A2:C2" )->Font->{Bold} = true;
   $Sheet->Range( "A2:C2" )->{ColumnWidth} = 18;

   my $Index;
   my $Percentage;
   for ($Index = MIN_COUNT; $Index <= MAX_COUNT; $Index++)
   {
      $Sheet->Cells( $Index + 3, 1 )->{Value} = $Index;

      $Sheet->Cells( $Index + 3, 2 )->{Value} = $gProbeCount[$Index];

      $Percentage = $gProbeCount[$Index] / $gSamples * 100.0;
      $Sheet->Cells( $Index + 3, 3 )->{Value} = $Percentage;
   }

   my $Txt = "> " . MAX_COUNT;
   $Sheet->Cells( $Index + 3, 1 )->{Value} = $Txt;

   $Sheet->Cells( $Index + 3, 2 )->{Value} = $gProbeCount[MAX_COUNT + 1];

   $Percentage = $gProbeCount[MAX_COUNT + 1] / $gSamples * 100.0;
   $Sheet->Cells( $Index + 3, 3 )->{Value} = $Percentage;

   my $Range = $Sheet->Range( "C2:C14" );
   if (!$Range)
   {
      return $RC;
   }

   my $Chart = $Sheet->Parent->Charts->Add();
   if (!$Chart)
   {
      return $RC;
   }

   $Chart->{ChartType} = xlLine;
   $Chart->SetSourceData( $Range, xlColumns );
   $Chart->Location( xlLocationAsNewSheet, "Chart" );

   # Setup a nice background
   $Chart->PlotArea->Fill->TwoColorGradient( 4, 1 );
   $Chart->PlotArea->Fill->ForeColor->{SchemeColor} = 37;
   $Chart->PlotArea->Fill->BackColor->{SchemeColor} = 2;

   # Disable markers
   $Chart->SeriesCollection(1)->{MarkerStyle} = xlNone;

   # Set titles
   $Chart->{HasTitle} = true;
   $Chart->Axes( 1, 1 )->{HasTitle} = true;
   $Chart->Axes( 2, 1 )->{HasTitle} = true;
   $Chart->ChartTitle->Characters->{Text} = "CDMA Access Probes";
   $Chart->Axes( 1, 1 )->AxisTitle->Characters->{Text} = "Probe Count";
   $Chart->Axes( 2, 1 )->AxisTitle->Characters->{Text} = "Percentage (%)";

   # XValues is X-axis label values
   $Range = $Sheet->Range( "A3:A14" );
   if ($Range)
   {
      $Chart->SeriesCollection(1)->{XValues} = $Range->{Value};
   }

   # Success!
   $RC = true;
   return $RC;
}

# Main body of script
sub Execute
{
   # Parse out arguments
   my $RC = ParseArguments();
   if ($RC == false)
   {
      return;
   }

   # Initialize ISF automation interface
   $RC = Initialize();
   if ($RC == false)
   {
      return;
   }

   # Obtain erasure rate data from ISF file
   $RC = Analyze();
   if ($RC == false)
   {
      return;
   }

   # Generate an Excel spreadsheet with the analysis results
   GenerateExcelSpreadsheet();
}

Execute();