# NOTE: This script must be run with Perl in a command box,
# i.e.  Perl HDRRRIData.pl <ISF File Name> [Excel File Name]

# This example demonstrates the usage of DM core automation
# interface and excel automation interface to plot
# HDR RRI data histogram

use strict;
use Win32::OLE;
use File::Spec;
use File::Basename;
use Cwd 'abs_path';
use Win32::OLE::Const 'Microsoft Excel';

#  Miscellaneous constants
use constant false    => 0;
use constant true     => 1;

# Global variables
my $IISF              = 0;
my $gSamples          = 0;
my @gMaxArray         = [];
my @gConditionalArray = [];
my @gTransmittedArray = [];

# ISF/Excel fully qualified paths
my $ISFAbsolutePath   = "";
my $XLSAbsolutePath   = "";

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
      "Syntax: Perl HDRRRIData.pl <ISF File Name> [Excel File Name]\n"
    . "Eg:     Perl HDRRRIData.pl \"HDR Data.isf\" \"HDR Data.xls\"\n";

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

# Perform analysis (obtain RRI data from ISF file)
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

   # Configure the client for log 0x1060
   $IConfig->AddLog( 0x1060 );
   $IConfig->CommitConfig();

   # Populate the client with all instances of log 0x1060
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
   for (my $Rate = 0; $Rate <= 5; $Rate++)
   {
      $gMaxArray[$Rate] = 0;
      $gConditionalArray[$Rate] = 0;
      $gTransmittedArray[$Rate] = 0;
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
      if ($FieldCount < 9)
      {
         next;
      }

      $gSamples++;

      # Power Amplifier Max
      my $MaxRate = $Fields->GetFieldValue( 5 );
      if (defined $gMaxArray[$MaxRate])
      {
         $gMaxArray[$MaxRate] += 1;
      }

      # Conditional RRI
      my $CondRRI = $Fields->GetFieldValue( 6 );
      if (defined $gConditionalArray[$CondRRI])
      {
         $gConditionalArray[$CondRRI] += 1;
      }

      # Actual Transmitted RRI
      my $TxRRI = $Fields->GetFieldValue( 7 );
      if (defined $gTransmittedArray[$TxRRI])
      {
         $gTransmittedArray[$TxRRI] += 1;
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

   $WB->{title} = "HDR RRI Data";

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

   $Sheet->Cells( 2, 1 )->{Value} = "Rate (kbps)";
   $Sheet->Cells( 2, 2 )->{Value} = "Max PA Total";
   $Sheet->Cells( 2, 3 )->{Value} = "Max PA %";
   $Sheet->Cells( 2, 4 )->{Value} = "Conditional Total";
   $Sheet->Cells( 2, 5 )->{Value} = "Conditional %";
   $Sheet->Cells( 2, 6 )->{Value} = "Transmitted Total";
   $Sheet->Cells( 2, 7 )->{Value} = "Transmitted %";
   $Sheet->Range( "A2:G2" )->Font->{Bold} = true;
   $Sheet->Range( "A2:G2" )->{ColumnWidth} = 18;

   $Sheet->Cells( 3, 1 )->{Value} = "0.0 kbps";
   $Sheet->Cells( 4, 1 )->{Value} = "9.6 kbps";
   $Sheet->Cells( 5, 1 )->{Value} = "19.2 kbps";
   $Sheet->Cells( 6, 1 )->{Value} = "38.4 kbps";
   $Sheet->Cells( 7, 1 )->{Value} = "76.8 kbps";
   $Sheet->Cells( 8, 1 )->{Value} = "153.6 kbps";

   my $Percentage;
   for (my $Rate = 0; $Rate <= 5; $Rate++)
   {
      $Sheet->Cells( $Rate + 3, 2 )->{Value} = $gMaxArray[$Rate];

      $Percentage = ($gMaxArray[$Rate] / $gSamples) * 100.0;
      $Sheet->Cells( $Rate + 3, 3 )->{Value} = $Percentage;

      $Sheet->Cells( $Rate + 3, 4 )->{Value} = $gConditionalArray[$Rate];

      $Percentage = ($gConditionalArray[$Rate] / $gSamples) * 100.0;
      $Sheet->Cells( $Rate + 3, 5 )->{Value} = $Percentage;

      $Sheet->Cells( $Rate + 3, 6 )->{Value} = $gTransmittedArray[$Rate];

      $Percentage = ($gTransmittedArray[$Rate] / $gSamples) * 100.0;
      $Sheet->Cells( $Rate + 3, 7 )->{Value} = $Percentage;
   }

   my $Range = $Sheet->Range( "C2:C8, E2:E8, G2:G8" );
   if (!$Range)
   {
      return $RC;
   }

   my $Chart = $Sheet->Parent->Charts->Add();
   if (!$Chart)
   {
      return $RC;
   }

   $Chart->{ChartType} = xlColumnClustered;
   $Chart->SetSourceData( $Range, xlColumns );
   $Chart->Location( xlLocationAsNewSheet, "Chart" );

   # Setup a nice background
   $Chart->PlotArea->Fill->TwoColorGradient( 4, 1 );
   $Chart->PlotArea->Fill->ForeColor->{SchemeColor} = 37;
   $Chart->PlotArea->Fill->BackColor->{SchemeColor} = 2;

   # Set titles
   $Chart->{HasTitle} = true;
   $Chart->Axes( 1, 1 )->{HasTitle} = true;
   $Chart->Axes( 2, 1 )->{HasTitle} = true;
   $Chart->ChartTitle->Characters->{Text} = "HDR RRI Data";
   $Chart->Axes( 1, 1 )->AxisTitle->Characters->{Text} = "Rate (kbps)";
   $Chart->Axes( 2, 1 )->AxisTitle->Characters->{Text} = "Percentage (%)";

   # XValues is X-axis label values
   $Range = $Sheet->Range( "A3:A8" );
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

   # Obtain RRI data from ISF file
   $RC = Analyze();
   if ($RC == false)
   {
      return;
   }

   # Generate an Excel spreadsheet with the analysis results
   GenerateExcelSpreadsheet();
}

Execute();