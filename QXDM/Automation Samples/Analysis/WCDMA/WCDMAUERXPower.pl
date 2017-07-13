# NOTE: This script must be run with Perl in a command box,
# i.e.  Perl WCDMAUERXPower.pl <ISF File Name> [Excel File Name]

# This example demonstrates the usage of DM core automation
# interface and excel automation interface to plot
# WCDMA UE rx power histogram

use strict;
use File::Spec;
use Win32::OLE;
use File::Basename;
use Cwd 'abs_path';
use Win32::OLE::Const 'Microsoft Excel';

#  Miscellaneous constants
use constant false     => 0;
use constant true      => 1;
use constant MIN_POWER => -110;
use constant MAX_POWER => -20;

# Global variables
my $IISF               = 0;
my $gRX0Samples        = 0;
my $gRX1Samples        = 0;
my %gRX0Power          = ();
my %gRX1Power          = ();

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
      "Syntax: CScript WCDMAUERXPower.js <ISF File Name> [Excel File Name]\n"
    . "Eg:     CScript WCDMAUERXPower.js \"WCDMA AGC.isf\" \"WCDMA AGC.xls\"\n";

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

   # Configure the client for log 0x4015
   $IConfig->AddLog( 0x4015 );
   $IConfig->CommitConfig();

   # Populate the client with all instances of log 0x4015
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
   for (my $r = MIN_POWER; $r <= MAX_POWER; $r++)
   {
      $gRX0Power{$r} = 0;
      $gRX1Power{$r} = 0;
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
      if ($FieldCount < 3)
      {
         next;
      }

      # Number of samples
      my $SamplesCount = $Fields->GetFieldValue( 0 );

      # Index of field "RX AGC"
      my $FieldIndex = 2;

      for (my $s = 0; $s < $SamplesCount; $s++, $FieldIndex += 14)
      {
         my $RX0 = $Fields->GetFieldValue( $FieldIndex );
         my $RX1 = $Fields->GetFieldValue( $FieldIndex + 5 );

         my $RX0Active = $Fields->GetFieldValue( $FieldIndex + 12 );
         my $RX1Active = $Fields->GetFieldValue( $FieldIndex + 11 );

         if ($RX0 >= -512 && $RX0 <= 511 && $RX0Active != 0)
         {
            $RX0 = -106.0 + (($RX0 + 512.0) / 12.0);
            $RX0 = sprintf( "%.6f", $RX0 );
            $RX0 = Round( $RX0 );

            if ($RX0 >= MIN_POWER && $RX0 <= MAX_POWER)
            {
               $gRX0Samples++;
               $gRX0Power{$RX0} += 1;
            }
         }

         if ($RX1 >= -512 && $RX1 <= 511 && $RX1Active != 0)
         {
            $RX1 = -106.0 + (($RX1 + 512.0) / 12.0);
            $RX1 = sprintf( "%.6f", $RX1 );
            $RX1 = Round( $RX1 );

            if ($RX1 >= MIN_POWER && $RX1 <= MAX_POWER)
            {
               $gRX1Samples++;
               $gRX1Power{$RX1} += 1;
            }
         }
      }
   }

   $Txt = "Done";
   print "$Txt\n";

   if ($gRX0Samples == 0)
   {
      $Txt = "Unable to find required data for processing";
      print "$Txt\n";

      return $RC;
   }

   # Diversity might not be enabled
   if ($gRX1Samples == 0)
   {
      $gRX1Samples == 1;
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

   $WB->{title} = "WCDMA UE RX Power";

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

   $Sheet->Cells( 1, 1 )->{Value} = "Total RX0 Samples";
   $Sheet->Cells( 1, 1 )->Font->{Bold} = true;
   $Sheet->Cells( 1, 1 )->{ColumnWidth} = 14;
   $Sheet->Cells( 1, 2 )->{Value} = $gRX0Samples;

   $Sheet->Cells( 2, 1 )->{Value} = "Total RX1 Samples";
   $Sheet->Cells( 2, 1 )->Font->{Bold} = true;
   $Sheet->Cells( 2, 1 )->{ColumnWidth} = 14;
   $Sheet->Cells( 2, 2 )->{Value} = $gRX1Samples;

   $Sheet->Cells( 3, 1 )->{Value} = "Power (dB)";
   $Sheet->Cells( 3, 2 )->{Value} = "RX 0 Power Total";
   $Sheet->Cells( 3, 3 )->{Value} = "RX 0 Power %";
   $Sheet->Cells( 3, 4 )->{Value} = "RX 1 Power Total";
   $Sheet->Cells( 3, 5 )->{Value} = "RX 1 Power %";
   $Sheet->Range( "A3:E3" )->Font->{Bold} = true;
   $Sheet->Range( "B3:E3" )->{ColumnWidth} = 16;

   my $r;
   my $Index;
   my $Percentage;
   for ($r = MIN_POWER, $Index = 0; $r <= MAX_POWER; $r++, $Index++)
   {
      $Sheet->Cells( $Index + 4, 1 )->{Value} = $r;

      $Sheet->Cells( $Index + 4, 2 )->{Value} = $gRX0Power{$r};

      $Percentage = $gRX0Power{$r} / $gRX0Samples * 100.0;
      $Sheet->Cells( $Index + 4, 3 )->{Value} = $Percentage;

      $Sheet->Cells( $Index + 4, 4 )->{Value} = $gRX1Power{$r};

      $Percentage = $gRX1Power{$r} / $gRX1Samples * 100.0;
      $Sheet->Cells( $Index + 4, 5 )->{Value} = $Percentage;
   }

   my $Range = $Sheet->Range( "C3:C94, E3:E94" );
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
   $Chart->ChartTitle->Characters->{Text} = "WCDMA UE RX Power";
   $Chart->Axes( 1, 1 )->AxisTitle->Characters->{Text} = "Power (dB)";
   $Chart->Axes( 2, 1 )->AxisTitle->Characters->{Text} = "Percentage (%)";

   # XValues is X-axis label values
   # $Chart->Axes( xlCategory )->{MajorTickMark} = xlTickMarkCross;
   $Chart->SeriesCollection(1)->{XValues} = "=Data!R4C1:R94C1";

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