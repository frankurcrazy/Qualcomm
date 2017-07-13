# NOTE: This script must be run with Perl in a command box,
# i.e.  Perl CDMARLPThroughput.pl <ISF File Name> [Excel File Name]

# This example demonstrates the usage of DM core automation
# interface and excel automation interface to plot
# CDMA RLP rx/tx throughput histogram

use strict;
use File::Spec;
use Win32::OLE;
use Time::Local;
use File::Basename;
use Cwd 'abs_path';
use Win32::OLE::Const 'Microsoft Excel';

#  Miscellaneous constants
use constant false    => 0;
use constant true     => 1;

use constant MIN_KBPS => 0;
use constant MAX_KBPS => 30;

# Global variables
my $IISF              = 0;
my $gLastTS           = 0;
my $gSamples          = 0;
my $gRXBytes          = 0;
my $gTXBytes          = 0;
my %gRXBytesArray     = ();
my %gTXBytesArray     = ();

# ISF/Excel fully qualified paths
my $ISFAbsolutePath   = "";
my $XLSAbsolutePath   = "";

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
      "Syntax: Perl CDMARLPThroughput.pl <ISF File Name> [Excel File Name]\n"
    . "Eg:     Perl CDMARLPThroughput.pl \"CDMA RLP.isf\" \"CDMA RLP.xls\"\n";

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

# Perform analysis (obtain rlp throughput from ISF file)
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

   # Configure the client for log 0x1031
   $IConfig->AddLog( 0x1031 );
   $IConfig->CommitConfig();

   # Populate the client with all instances of log 0x1031
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
   for (my $r = MIN_KBPS; $r <= MAX_KBPS; $r += 1)
   {
      $gRXBytesArray{$r} = 0;
      $gTXBytesArray{$r} = 0;
   }

   # Process all items in the client
   for (my $ItemIndex = 0; $ItemIndex < $ItemCount; $ItemIndex++)
   {
      my $Item = $IClient->GetClientItem( $ClientHandle, $ItemIndex );
      if (!$Item)
      {
         next;
      }

      my $Fields = $Item->GetConfiguredItemFields( "", true, false );
      if (!$Fields)
      {
         next;
      }

      my $FieldCount = $Fields->GetFieldCount();
      if ($FieldCount < 25)
      {
         next;
      }

      $gSamples++;

      my $RXBytes = $Fields->GetFieldValueText( 16 );
      my $TXBytes = $Fields->GetFieldValueText( 23 );

      # "05/19/2004 18:20:30.864"
      my $CurrentTS = $Item->GetItemSpecificTimestampText( true, true );
      my @TS = split( /\s/, $CurrentTS );
      my @Date = split( /\//, $TS[0] );
      my @Time = split( /\:/, $TS[1] );
      my @Secs = split( /\./, $Time[2] );
      $CurrentTS = timegm( $Secs[0], $Time[1], $Time[0], $Date[1], $Date[0], $Date[2] );
      $CurrentTS = $CurrentTS * 1000 + $Secs[1];

      # First item?
      if ($gLastTS == 0)
      {
         $gLastTS = $CurrentTS;

         $gRXBytes = $RXBytes;
         $gTXBytes = $TXBytes;
      }
      elsif ($gLastTS >= $CurrentTS)
      {
         return $RC;
      }

      my $DeltaMS = $CurrentTS - $gLastTS;
      if ($DeltaMS == 0)
      {
         next;
      }

      # Make sure we have a valid delta for bytes
      if ($RXBytes < $gRXBytes)
      {
         $gRXBytes = $RXBytes;
      }

      if ($TXBytes < $gTXBytes)
      {
         $gTXBytes = $TXBytes;
      }

      # RX KB/s
      my $DeltaRXBytes = $RXBytes - $gRXBytes;
      $DeltaRXBytes = ((1000.0 * $DeltaRXBytes) / $DeltaMS) / 1000.0;
      $DeltaRXBytes = Round( $DeltaRXBytes );

      if ($DeltaRXBytes >= MIN_KBPS && $DeltaRXBytes <= MAX_KBPS)
      {
         $gRXBytesArray{$DeltaRXBytes} += 1;
      }

      # TX KB/s
      my $DeltaTXBytes = $TXBytes - $gTXBytes;
      $DeltaTXBytes = ((1000.0 * $DeltaTXBytes) / $DeltaMS) / 1000.0;
      $DeltaTXBytes = Round( $DeltaTXBytes );

      if ($DeltaTXBytes >= MIN_KBPS && $DeltaTXBytes <= MAX_KBPS)
      {
         $gTXBytesArray{$DeltaTXBytes} += 1;
      }

      # Get ready for the next pass
      $gLastTS = $CurrentTS;
      $gRXBytes = $RXBytes;
      $gTXBytes = $TXBytes;
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

   $WB->{title} = "CDMA RLP RX/TX Throughput";

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

   $Txt = "Generating Excel spreadsheet..";
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

   $Sheet->Cells( 2, 1 )->{Value} = "KBps";
   $Sheet->Cells( 2, 2 )->{Value} = "RX KBps Total";
   $Sheet->Cells( 2, 3 )->{Value} = "RX KBps %";
   $Sheet->Cells( 2, 4 )->{Value} = "TX KBps Total";
   $Sheet->Cells( 2, 5 )->{Value} = "TX KBps %";

   $Sheet->Range( "A2:E2" )->Font->{Bold} = true;
   $Sheet->Range( "A2:E2" )->{ColumnWidth} = 16;

   my $r;
   my $Index;
   my $Percentage;
   for ($r = MIN_KBPS, $Index = 0; $r <= MAX_KBPS; $r += 1, $Index++)
   {
      $Sheet->Cells( $Index + 3, 1 )->{Value} = $r;

      $Sheet->Cells( $Index + 3, 2 )->{Value} = $gRXBytesArray{$r};

      $Percentage = $gRXBytesArray{$r} / $gSamples * 100.0;
      $Sheet->Cells( $Index + 3, 3 )->{Value} = $Percentage;

      $Sheet->Cells( $Index + 3, 4 )->{Value} = $gTXBytesArray{$r};

      $Percentage = $gTXBytesArray{$r} / $gSamples * 100.0;
      $Sheet->Cells( $Index + 3, 5 )->{Value} = $Percentage;
   }

   my $Range = $Sheet->Range( "C2:C33, E2:E33" );
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
   $Chart->ChartTitle->Characters->{Text} = "CDMA RLP RX/TX Throughput";
   $Chart->Axes( 1, 1 )->AxisTitle->Characters->{Text} = "KBps";
   $Chart->Axes( 2, 1 )->AxisTitle->Characters->{Text} = "Percentage (%)";

   # XValues is X-axis label values
   $Range = $Sheet->Range( "A3:A33" );
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

   # Obtain rlp throughput from ISF file
   $RC = Analyze();
   if ($RC == false)
   {
      return;
   }

   # Generate an Excel spreadsheet with the analysis results
   GenerateExcelSpreadsheet();
}

Execute();