# NOTE: This script must be run with Perl in a command box,
# i.e.  Perl CDMAForwardErasureRate.pl <ISF File Name> [Excel File Name]

# This example demonstrates the usage of DM core automation
# interface and excel automation interface to plot
# CDMA forward erasure rate histogram

use strict;
use File::Spec;
use Win32::OLE;
use File::Basename;
use Cwd 'abs_path';
use Win32::OLE::Const 'Microsoft Excel';

#  Miscellaneous constants
use constant false      => 0;
use constant true       => 1;

use constant MIN_BLOCKS => 0;
use constant MAX_BLOCKS => 200;

# Global variables
my $IISF                = 0;
my $gSamples            = 0;
my @gErasures           = [];
my $gCurrentTotal       = 0;
my $gCurrentError       = 0;

# ISF/Excel fully qualified paths
my $ISFAbsolutePath     = "";
my $XLSAbsolutePath     = "";

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
      "Syntax: Perl CDMAForwardErasureRate.pl <ISF File Name> [Excel File Name]\n"
    . "Eg:     Perl CDMAForwardErasureRate.pl \"Markov.isf\" \"Markov.xls\"\n";

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

# Perform analysis (obtain erasure rate data from ISF file)
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

   # Configure the client for log 0x100E
   $IConfig->AddLog( 0x100E );
   $IConfig->CommitConfig();

   # Populate the client with all instances of log 0x100E
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
   for (my $r = MIN_BLOCKS; $r <= MAX_BLOCKS; $r += 2)
   {
      $gErasures[$r] = 0;
   }

   my @MapMUX = [];
   $MapMUX[0] = 0;
   $MapMUX[1] = 1;
   $MapMUX[2] = 1;
   $MapMUX[3] = 1;
   $MapMUX[4] = 1;
   $MapMUX[5] = 0;
   $MapMUX[6] = 0;
   $MapMUX[7] = 0;
   $MapMUX[8] = 2;
   $MapMUX[9] = 2;
   $MapMUX[10] = 2;
   $MapMUX[11] = 2;
   $MapMUX[12] = 1;
   $MapMUX[13] = 2;
   $MapMUX[14] = 3;
   $MapMUX[15] = 0;

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
      if ($FieldCount < 1)
      {
         next;
      }

      my $FI = 0;
      my $NumEntries = $Fields->GetFieldValue( $FI++ );
      for (my $n = 0; $n < $NumEntries; $n++, $FI += 3)
      {
         my $ExpectedRate = $Fields->GetFieldValue( $FI );
         if ($ExpectedRate == 0xC || $ExpectedRate == 0xD || $ExpectedRate == 0xF)
         {
            next;
         }

         my $MUXNumber = $MapMUX[$ExpectedRate];
         if ($MUXNumber > 2 || ($ExpectedRate > 7 && $MUXNumber == 0))
         {
            next;
         }

         my $ActualRate = $Fields->GetFieldValue( $FI + 1 );
         if ($MUXNumber == 2)
         {
            $ActualRate += 16;
         }

         my $Erased = false;
         if ($ActualRate == 8 || $ActualRate == 9 || $ActualRate == 25)
         {
            $Erased = true;
         }

         if ($ActualRate < 26)
         {
            $gCurrentTotal++;

            if ($Erased)
            {
               $gCurrentError++;
            }
         }

         if ($gCurrentTotal == 500)
         {
            $gSamples++;

            my $PercentError = $gCurrentError / $gCurrentTotal * 100.0;
            $PercentError *= 10;
            $PercentError = sprintf( "%.0f", $PercentError );
            $gErasures[$PercentError] += 1;

            $gCurrentTotal = 0;
            $gCurrentError = 0;
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

   $WB->{title} = "CDMA Forward Erasure Rate";

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

   $Sheet->Cells( 2, 1 )->{Value} = "Blocks";
   $Sheet->Cells( 2, 2 )->{Value} = "Blocks Total";
   $Sheet->Cells( 2, 3 )->{Value} = "Blocks %";

   $Sheet->Range( "A2:C2" )->Font->{Bold} = true;
   $Sheet->Range( "A2:C2" )->{ColumnWidth} = 16;

   my $r;
   my $Index;
   my $e = 0.0;
   my $ErasureTotal = 0;
   for ($r = MIN_BLOCKS, $Index = 0; $r <= MAX_BLOCKS; $r += 2, $e += 0.2, $Index++)
   {
      $Sheet->Cells( $Index + 3, 1 )->{Value} = $e;

      $ErasureTotal += $gErasures[$r];
      $Sheet->Cells( $Index + 3, 2 )->{Value} = $gErasures[$r];
   }

   $Index = 0;
   my $Percentage;
   for ($r = MIN_BLOCKS, $Index = 0; $r <= MAX_BLOCKS; $r += 2, $Index++)
   {
      $Percentage = $gErasures[$r] / $ErasureTotal * 100.0;
      $Sheet->Cells( $Index + 3, 3 )->{Value} = $Percentage;
   }

   my $Range = $Sheet->Range( "C2:C103" );
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
   $Chart->ChartTitle->Characters->{Text} = "CDMA Forward Erasure Rate";
   $Chart->Axes( 1, 1 )->AxisTitle->Characters->{Text} = "Blocks";
   $Chart->Axes( 2, 1 )->AxisTitle->Characters->{Text} = "Percentage (%)";

   # XValues is X-axis label values
   $Chart->Axes( xlCategory )->{MajorTickMark} = xlTickMarkCross;
   $Chart->SeriesCollection(1)->{XValues} = "=Data!R3C1:R103C1";

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