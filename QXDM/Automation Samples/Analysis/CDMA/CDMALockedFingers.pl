# NOTE: This script must be run with Perl in a command box,
# i.e.  Perl CDMALockedFingers.pl <ISF File Name> [Excel File Name]

# This example demonstrates the usage of DM core automation
# interface and excel automation interface to plot
# CDMA locked fingers histogram

use strict;
use File::Spec;
use Win32::OLE;
use File::Basename;
use Cwd 'abs_path';
use Win32::OLE::Const 'Microsoft Excel';

#  Miscellaneous constants
use constant false       => 0;
use constant true        => 1;

# Maximum number of fingers we support
use constant MAX_FINGERS => 6;

# Global variables
my $IISF                 = 0;
my $gSamples             = 0;
my @gLockedGood          = [];
my @gLockedStrong        = [];
my @gLockedVeryStrong    = [];
my @gLockedFingerArray   = [];

# ISF/Excel fully qualified paths
my $ISFAbsolutePath      = "";
my $XLSAbsolutePath      = "";

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
      "Syntax: Perl CDMALockedFingers.pl <ISF File Name> [Excel File Name]\n"
    . "Eg:     Perl CDMALockedFingers.pl \"CDMA Finger.isf\" \"CDMA Finger.xls\"\n";

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

# Perform analysis (obtain locked fingers data from ISF file)
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
   $IConfig->AddLog( 0x119A );
   $IConfig->AddLog( 0x119B );
   $IConfig->AddLog( 0x119C );
   $IConfig->AddLog( 0x119D );
   $IConfig->AddLog( 0x119E );
   $IConfig->AddLog( 0x119F );
   $IConfig->AddLog( 0x11A0 );
   $IConfig->AddLog( 0x11A1 );
   $IConfig->AddLog( 0x11A2 );
   $IConfig->AddLog( 0x11A3 );

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

   # Initialize arrays
   for (my $Finger = 0; $Finger <= MAX_FINGERS; $Finger++)
   {
      $gLockedGood[$Finger] = 0;
      $gLockedStrong[$Finger] = 0;
      $gLockedVeryStrong[$Finger] = 0;
      $gLockedFingerArray[$Finger] = 0;
   }

   # No need to repeatedly compute this
   my $Den = 64.0 * 64.0 * 18.0;

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

      my $MaxFieldIndex = $Fields->GetFieldCount();
      if (--$MaxFieldIndex < 2)
      {
         next;
      }

      my $FI = 1;
      my $NumPackets = $Fields->GetFieldValue( $FI );
      for (my $n = 0; $n < $NumPackets; $n++)
      {
         # Index for "ID" field
         $FI = $Fields->GetFieldIndexFromByID( 21003, ++$FI, false );
         if ($FI == 0xFFFFFFFF)
         {
            last;
         }

         if ($MaxFieldIndex < $FI + 6)
         {
            next;
         }

         # Finger status subpacket?
         my $ID = $Fields->GetFieldValue( $FI );
         if ($ID != 4)
         {
            next;
         }

         # A version we recognize?
         my $Version = $Fields->GetFieldValue( $FI + 1 );
         if ($Version != 1)
         {
            next;
         }

         # Number of fingers
         my $FingCount = $Fields->GetFieldValue( $FI + 6 );
         if ($FingCount > MAX_FINGERS)
         {
            $FingCount = MAX_FINGERS;
         }

         if ( ($FingCount == 0)
         ||   ($MaxFieldIndex < ($FI + (6 + ($FingCount * 38)))) )
         {
            next;
         }

         # Compute pilot filter gain factor
         my $PFRaw = $Fields->GetFieldValue( $FI + 3 );
         my $PF = $PFRaw / 128.0;
         $PF = $PF / (64.0 * (2.0 - $PF));

         $gSamples++;

         my $Good = 0;
         my $Strong = 0;
         my $LockedFing = 0;
         my $VeryStrong = 0;

         # Start of finger record
         $FI += 7;

         # Process each finger record
         for (my $Finger = 0; $Finger < $FingCount; $Finger++, $FI += 38)
         {
            my $PN = $Fields->GetFieldValue( $FI );
            if ($PN == 0xFFFF)
            {
               next;
            }

            my $Assigned = $Fields->GetFieldValue( $FI + 30 );
            if ($Assigned != 1)
            {
               next;
            }

            my $Locked = $Fields->GetFieldValue( $FI + 31 );
            if ($Locked != 1)
            {
               next;
            }

            $LockedFing++;

            my $RSSI = $Fields->GetFieldValue( $FI + 1 );
            if ($RSSI <= 0)
            {
               next;
            }

            # Convert RSSI value to dB
            $RSSI = $RSSI / $Den;
            $RSSI -= $PF;

            if ($RSSI < 0.00001)
            {
               $RSSI = 0.00001;
            }

            $RSSI = 10.0 * (log( $RSSI ) / log(10.0));

            # Good signal strength
            if ($RSSI >= -13.0)
            {
               $Good++;
            }

            # Strong signal strength
            if ($RSSI >= -10.0)
            {
               $Strong++;
            }

            # Very strong signal strength
            if ($RSSI >= -7.0)
            {
               $VeryStrong++;
            }
         }

         $gLockedGood[$Good] += 1;
         $gLockedStrong[$Strong] += 1;
         $gLockedVeryStrong[$VeryStrong] += 1;
         $gLockedFingerArray[$LockedFing] += 1;
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

   $WB->{title} = "CDMA Locked Fingers Data";

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

   $Sheet->Cells( 2, 1 )->{Value} = "Locked Fingers";
   $Sheet->Cells( 2, 2 )->{Value} = "Fingers Locked Total";
   $Sheet->Cells( 2, 3 )->{Value} = "Fingers Locked  %";
   $Sheet->Cells( 2, 4 )->{Value} = "Good Fingers Total";
   $Sheet->Cells( 2, 5 )->{Value} = "Good Fingers %";
   $Sheet->Cells( 2, 6 )->{Value} = "Strong Fingers Total";
   $Sheet->Cells( 2, 7 )->{Value} = "Strong Fingers %";
   $Sheet->Cells( 2, 8 )->{Value} = "Very Strong Fingers Total";
   $Sheet->Cells( 2, 9 )->{Value} = "Very Strong Fingers %";

   $Sheet->Range( "A2:G2" )->Font->{Bold} = true;
   $Sheet->Range( "B2:G2" )->{ColumnWidth} = 20;
   $Sheet->Range( "H2:I2" )->Font->{Bold} = true;
   $Sheet->Range( "H2:I2" )->{ColumnWidth} = 24;

   my $GoodTotal = 0;
   my $StrongTotal = 0;
   my $LockedTotal = 0;
   my $VeryStrongTotal = 0;
   for (my $Finger = 0; $Finger <= MAX_FINGERS; $Finger++)
   {
      $Sheet->Cells( $Finger + 3, 1 )->{Value} = $Finger;

      $GoodTotal += $gLockedGood[$Finger];
      $StrongTotal += $gLockedStrong[$Finger];
      $LockedTotal += $gLockedFingerArray[$Finger];
      $VeryStrongTotal += $gLockedVeryStrong[$Finger];
   }

   my $Percentage;
   for (my $Finger = 0; $Finger <= MAX_FINGERS; $Finger++)
   {
      $Sheet->Cells( $Finger + 3, 2 )->{Value} = $gLockedFingerArray[$Finger];

      $Percentage = ($gLockedFingerArray[$Finger] / $LockedTotal) * 100.0;
      $Sheet->Cells( $Finger + 3, 3 )->{Value} = $Percentage;

      $Sheet->Cells( $Finger + 3, 4 )->{Value} = $gLockedGood[$Finger];

      $Percentage = ($gLockedGood[$Finger] / $GoodTotal) * 100.0;
      $Sheet->Cells( $Finger + 3, 5 )->{Value} = $Percentage;

      $Sheet->Cells( $Finger + 3, 6 )->{Value} = $gLockedStrong[$Finger];

      $Percentage = ($gLockedStrong[$Finger] / $StrongTotal) * 100.0;
      $Sheet->Cells( $Finger + 3, 7 )->{Value} = $Percentage;

      $Sheet->Cells( $Finger + 3, 8 )->{Value} = $gLockedVeryStrong[$Finger];

      $Percentage = ($gLockedVeryStrong[$Finger] / $VeryStrongTotal) * 100.0;
      $Sheet->Cells( $Finger + 3, 9 )->{Value} = $Percentage;
   }

   my $Range = $Sheet->Range( "C2:C9, E2:E9, G2:G9, I2:I9" );
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
   $Chart->ChartTitle->Characters->{Text} = "HDR Locked Fingers";
   $Chart->Axes( 1, 1 )->AxisTitle->Characters->{Text} = "Locked Fingers";
   $Chart->Axes( 2, 1 )->AxisTitle->Characters->{Text} = "Percentage (%)";

   # XValues is X-axis label values
   $Range = $Sheet->Range( "A3:A9" );
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

   # Obtain locked fingers data from ISF file
   $RC = Analyze();
   if ($RC == false)
   {
      return;
   }

   # Generate an Excel spreadsheet with the analysis results
   GenerateExcelSpreadsheet();
}

Execute();