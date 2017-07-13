# NOTE: This script must be run with Perl in a command box,
# i.e.  Perl HDRRXPower.pl <ISF File Name> [Excel File Name]

# This example demonstrates the usage of DM core automation
# interface and excel automation interface to plot
# HDR RX power histogram

use strict;
use File::Spec;
use Win32::OLE;
use File::Basename;
use Cwd 'abs_path';
use Win32::OLE::Const 'Microsoft Excel';

#  Miscellaneous constants
use constant false     => 0;
use constant true      => 1;
use constant MIN_POWER => -100;
use constant MAX_POWER => -10;

# Global variables
my $IISF               = 0;
my $gSamples           = 0;
my %gRXAnt0Power       = ();
my %gRXAnt1Power       = ();

# ISF/Excel fully qualified paths
my $ISFAbsolutePath    = "";
my $XLSAbsolutePath    = "";

# Round the value
sub Round
{
   my $Value = shift;
   return (($Value < 0.0) ? int( $Value - 0.5 ) : int( $Value + 0.5 ));
}

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
      "Syntax: Perl HDRRXPower.pl <ISF File Name> [Excel File Name]\n"
    . "Eg:     Perl HDRRXPower.pl \"HDR Power.isf\" \"HDR Power.xls\"\n";

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

# Perform analysis (obtain rx power data from ISF file)
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

   # Configure the client for log 0x1069
   $IConfig->AddLog( 0x1069 );
   $IConfig->CommitConfig();

   # Populate the client with all instances of log 0x1069
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

   # Initialize arrays
   for (my $r = MIN_POWER; $r <= MAX_POWER; $r++)
   {
      $gRXAnt0Power{$r} = 0;
      $gRXAnt1Power{$r} = 0;
   }

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
      if ($FieldCount < 18)
      {
         next;
      }

      $gSamples += 2;

      # "RX AGC - Antenna 0" field index
      my $FieldIndex = 7;

      for (my $Frame = 1; $Frame <= 2; $Frame++, $FieldIndex += 9)
      {
         my $Ant0Power = $Fields->GetFieldValue( $FieldIndex );
         my $Ant1Power = $Fields->GetFieldValue( $FieldIndex + 1 );

         # Convert to dBm and store
         $Ant0Power = $Ant0Power / 256.0;
         $Ant0Power = sprintf( "%.6f", $Ant0Power );
         $Ant0Power = Round( $Ant0Power );
         if ($Ant0Power >= MIN_POWER && $Ant0Power <= MAX_POWER)
         {
            $gRXAnt0Power{$Ant0Power} += 1;
         }

         $Ant1Power = $Ant1Power / 256.0;
         $Ant1Power = sprintf( "%.6f", $Ant1Power );
         $Ant1Power = Round( $Ant1Power );
         if ($Ant1Power >= MIN_POWER && $Ant1Power <= MAX_POWER)
         {
            $gRXAnt1Power{$Ant1Power} += 1;
         }
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

   $WB->{title} = "HDR RX Power";

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

   $Sheet->Cells( 2, 1 )->{Value} = "Power (dBm)";
   $Sheet->Cells( 2, 2 )->{Value} = "Antenna 0 Power Total";
   $Sheet->Cells( 2, 3 )->{Value} = "Antenna 0 Power %";
   $Sheet->Cells( 2, 4 )->{Value} = "Antenna 1 Power Total";
   $Sheet->Cells( 2, 5 )->{Value} = "Antenna 1 Power %";
   $Sheet->Range( "A2:E2" )->Font->{Bold} = true;
   $Sheet->Range( "B2:E2" )->{ColumnWidth} = 24;

   my $r;
   my $Index;
   for ($r = MIN_POWER, $Index = 0; $r <= MAX_POWER; $r++, $Index++)
   {
      $Sheet->Cells( $Index + 3, 1 )->{Value} = $r;

      $Sheet->Cells( $Index + 3, 2 )->{Value} = $gRXAnt0Power{$r};
      $Sheet->Cells( $Index + 3, 4 )->{Value} = $gRXAnt1Power{$r};
   }

   my $Percentage;
   for ($r = MIN_POWER, $Index = 0; $r <= MAX_POWER; $r++, $Index++)
   {
      $Percentage = $gRXAnt0Power{$r} / $gSamples * 100.0;
      $Sheet->Cells( $Index + 3, 3 )->{Value} = $Percentage;

      $Percentage = $gRXAnt1Power{$r} / $gSamples * 100.0;
      $Sheet->Cells( $Index + 3, 5 )->{Value} = $Percentage;
   }

   my $Range = $Sheet->Range( "C2:C93, E2:E93" );
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
   $Chart->SeriesCollection(2)->{MarkerStyle} = xlNone;

   # Set titles
   $Chart->{HasTitle} = true;
   $Chart->Axes( 1, 1 )->{HasTitle} = true;
   $Chart->Axes( 2, 1 )->{HasTitle} = true;
   $Chart->ChartTitle->Characters->{Text} = "HDR RX Power";
   $Chart->Axes( 1, 1 )->AxisTitle->Characters->{Text} = "Power (dBm)";
   $Chart->Axes( 2, 1 )->AxisTitle->Characters->{Text} = "Percentage (%)";

   # XValues is X-axis label values
   $Chart->Axes( xlCategory )->{MajorTickMark} = xlTickMarkCross;
   $Chart->SeriesCollection(1)->{XValues} = "=Data!R3C1:R93C1";

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

   # Obtain rx power data from ISF file
   $RC = Analyze();
   if ($RC == false)
   {
      return;
   }

   # Generate an Excel spreadsheet with the analysis results
   GenerateExcelSpreadsheet();
}

Execute();