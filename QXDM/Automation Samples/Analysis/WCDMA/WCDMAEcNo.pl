# NOTE: This script must be run with Perl in a command box,
# i.e.  Perl WCDMAEcNo.pl <ISF File Name> [Excel File Name]

# This example demonstrates the usage of DM core automation
# interface and excel automation interface to plot
# WCDMA EcNo histogram

use strict;
use File::Spec;
use Win32::OLE;
use File::Basename;
use Cwd 'abs_path';
use Win32::OLE::Const 'Microsoft Excel';

#  Miscellaneous constants
use constant false      => 0;
use constant true       => 1;
use constant MIN_ENERGY => -20;
use constant MAX_ENERGY => 0;

# Global variables
my $IISF                = 0;
my $gAllSamples         = 0;
my $gCampedSamples      = 0;
my %gAllEnergy          = ();
my %gCampedEnergy       = ();

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
      "Syntax: Perl WCDMAEcNo.pl <ISF File Name> [Excel File Name]\n"
    . "Eg:     Perl WCDMAEcNo.pl \"WCDMA EcNo.isf\" \"WCDMA EcNo.xls\"\n";

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

# Perform analysis (obtain cell energy data from ISF file)
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
   $IConfig->AddLog( 0x4017 );
   $IConfig->AddLog( 0x413F );
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
   for (my $c = MIN_ENERGY; $c <= MAX_ENERGY; $c++)
   {
      $gAllEnergy{$c} = 0;
      $gCampedEnergy{$c} = 0;
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
      if ($FieldCount < 2)
      {
         next;
      }

      # Number of specified tasks
      my $TasksCount = $Fields->GetFieldValue( 1 );
      if ($TasksCount <= 0)
      {
         next;
      }

      my $FieldCount = $Fields->GetFieldCount();
      if ($FieldCount < 2 + ($TasksCount * 19))
      {
         next;
      }

      my $BestAll = -1000.0;
      my $BestCamped = -1000.0;

      # Process each task computing combined energy
      my $FI = 2;
      my $FO = $TasksCount * 10;
      for (my $t = 0; $t < $TasksCount; $t++, $FI += 10, $FO += 9)
      {
         my $CellSet = $Fields->GetFieldValue( $FI + 5 );

         my $N = $Fields->GetFieldValue( $FI );
         my $M = $Fields->GetFieldValue( $FI + 1 );
         if ($N == 0 || $M == 0)
         {
            next;
         }

         my $Sum = $Fields->GetFieldValue( $FO + 6 );
         $Sum += $Fields->GetFieldValue( $FO + 7 );
         $Sum += $Fields->GetFieldValue( $FO + 8 );
         $Sum += $Fields->GetFieldValue( $FO + 9 );

         my $Num = $Sum - (0.1406 * $M * $N);
         my $Den = 0.1406 * $M * $N * $N;

         my $Tmp = $Num / $Den;
         if ($Tmp <= 0)
         {
            next;
         }

         my $Energy = 10.0 * (log( $Tmp ) / log(10.0));

         # Camped?
         if ($CellSet == 0)
         {
            if ($Energy > $BestCamped)
            {
               $BestCamped = $Energy;
            }
         }

         if ($Energy > $BestAll)
         {
            $BestAll = $Energy;
         }
      }

      $BestAll = sprintf( "%2.0f", $BestAll );
      $BestCamped = sprintf( "%2.0f", $BestCamped );

      if ($BestAll >= MIN_ENERGY && $BestAll <= MAX_ENERGY)
      {
         $gAllSamples++;
         $gAllEnergy{$BestAll} += 1;
      }

      if ($BestCamped >= MIN_ENERGY && $BestCamped <= MAX_ENERGY)
      {
         $gCampedSamples++;
         $gCampedEnergy{$BestCamped} += 1;
      }
   }

   $Txt = "Done";
   print "$Txt\n";

   if ($gAllSamples == 0 || $gCampedSamples == 0)
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

   $WB->{title} = "WCDMA Ec/No";

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

   $Sheet->Cells( 1, 1 )->{Value} = "Camped Cell Samples";
   $Sheet->Cells( 1, 1 )->Font->{Bold} = true;
   $Sheet->Cells( 1, 2 )->{Value} = $gCampedSamples;

   $Sheet->Cells( 2, 1 )->{Value} = "Best Cell Samples";
   $Sheet->Cells( 2, 1 )->Font->{Bold} = true;
   $Sheet->Cells( 2, 2 )->{Value} = $gAllSamples;

   $Sheet->Cells( 3, 1 )->{Value} = "Energy";
   $Sheet->Cells( 3, 2 )->{Value} = "Camped Cell Total";
   $Sheet->Cells( 3, 3 )->{Value} = "Camped Cell %";
   $Sheet->Cells( 3, 4 )->{Value} = "Best Cell Total";
   $Sheet->Cells( 3, 5 )->{Value} = "Best Cell %";
   $Sheet->Range( "A3:E3" )->Font->{Bold} = true;
   $Sheet->Range( "A3:E3" )->{ColumnWidth} = 18;

   my $Index = 0;
   my $Energy;
   my $Percentage;
   for (my $Energy = MIN_ENERGY; $Energy <= MAX_ENERGY; $Energy++, $Index++)
   {
      $Sheet->Cells( $Index + 4, 1 )->{Value} = $Energy;
      $Sheet->Cells( $Index + 4, 2 )->{Value} = $gCampedEnergy{$Energy};

      $Percentage = $gCampedEnergy{$Energy} / $gCampedSamples * 100.0;
      $Sheet->Cells( $Index + 4, 3 )->{Value} = $Percentage;

      $Sheet->Cells( $Index + 4, 4 )->{Value} = $gAllEnergy{$Energy};

      $Percentage = $gAllEnergy{$Energy} / $gAllSamples * 100.0;
      $Sheet->Cells( $Index + 4, 5 )->{Value} = $Percentage;
   }

   my $Range = $Sheet->Range( "C3:C24, E3:E24" );
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
   $Chart->ChartTitle->Characters->{Text} = "WCDMA Ec/No";
   $Chart->Axes( 1, 1 )->AxisTitle->Characters->{Text} = "Combined Energy (dB)";
   $Chart->Axes( 2, 1 )->AxisTitle->Characters->{Text} = "Percentage (%)";

   # XValues is X-axis label values
   $Range = $Sheet->Range( "A4:A24" );
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

   # Obtain cell energy data from ISF file
   $RC = Analyze();
   if ($RC == false)
   {
      return;
   }

   # Generate an Excel spreadsheet with the analysis results
   GenerateExcelSpreadsheet();
}

Execute();