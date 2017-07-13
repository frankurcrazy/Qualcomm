// NOTE: This script must be run from CScript in a command box,
// i.e.  CScript CDMAForwardErasureRate.js <ISF File Name> [Excel File Name]

// This example demonstrates the usage of DM core automation
// interface and excel automation interface to plot
// CDMA forward erasure rate histogram

var MIN_BLOCKS      = 0;
var MAX_BLOCKS      = 200;

// Global variables
var IISF            = null;
var gSamples        = 0;
var gErasures       = new Array();
var gCurrentTotal   = 0;
var gCurrentError   = 0;

// ISF/Excel fully qualified paths
var ISFAbsolutePath = "";
var XLSAbsolutePath = "";

// Process the argument - ISF file name
function ParseArguments()
{
   // Assume failure
   var RC = false;
   var Txt = "";
   var Help =
      "Syntax: CScript CDMAForwardErasureRate.js <ISF File Name> [Excel File Name]\n"
    + "Eg:     CScript CDMAForwardErasureRate.js \"Markov.isf\" \"Markov.xls\"\n";

   // Grab the shell
   var SH = new ActiveXObject( "WScript.Shell" );
   if (SH == null)
   {
      Txt = "Unable to interact with Windows shell";
      WScript.StdOut.WriteLine( Txt );

      return RC;
   }

   var FSO = new ActiveXObject( "Scripting.FileSystemObject" );
   if (FSO == null)
   {
      Txt = "Unable to get file system object";
      WScript.StdOut.WriteLine( Txt );

      return RC;
   }

   var Args = WScript.Arguments;
   if (Args.length < 1)
   {
      WScript.StdOut.WriteLine( Help );

      return RC;
   }

   var ISFFileName = WScript.Arguments( 0 );
   if (ISFFileName == "")
   {
      Txt = "Invalid ISF file name\n\n" + Help;
      WScript.StdOut.WriteLine( Txt );

      return RC;
   }

   ISFAbsolutePath = FSO.GetAbsolutePathName( ISFFileName );
   if (ISFAbsolutePath == "")
   {
      Txt = "Invalid ISF file name\n\n" + Help;
      WScript.StdOut.WriteLine( Txt );

      return RC;
   }

   if (Args.length == 2)
   {
      var XLSFileName = WScript.Arguments( 1 );
      if (XLSFileName == "")
      {
         Txt = "Invalid Excel file name\n\n" + Help;
         WScript.StdOut.WriteLine( Txt );

         return RC;
      }

      XLSAbsolutePath = FSO.GetAbsolutePathName( XLSFileName );
      if (XLSAbsolutePath == "")
      {
         Txt = "Invalid Excel file name\n\n" + Help;
         WScript.StdOut.WriteLine( Txt );

         return RC;
      }
   }
   else
   {
      // Generate Excel file name from ISF file name
      XLSAbsolutePath = ISFAbsolutePath + ".xls";
   }

   // Success
   RC = true;
   return RC;
}

// Initialize application
function Initialize()
{
   // Assume failure
   var RC = false;
   var Txt = "";

   // Create the item store file interface
   IISF = new ActiveXObject( "DMCoreAutomation.ItemStoreFiles" );
   if (IISF == null)
   {
      WScript.StdOut.WriteLine( "Unable to obtain ISF interface" );
      return RC;
   }

   // Success
   RC = true;
   return RC;
}

// Perform analysis (obtain erasure rate data from ISF file)
function Analyze()
{
   // Assume failure
   var RC  = false;
   var Txt = "";

   Txt = "Loading ISF file:\n" + ISFAbsolutePath;
   WScript.StdOut.WriteLine( Txt );

   // Load the item store file
   var Handle = IISF.LoadItemStore( ISFAbsolutePath );
   if (Handle == 0xFFFFFFFF)
   {
      Txt = "Unable to load ISF:\n" + ISFAbsolutePath;
      WScript.StdOut.WriteLine( Txt );

      return RC;
   }

   var IClient = IISF.GetClientInterface( Handle );
   if (IClient == null)
   {
      Txt = "Unable to obtain ISF client interface";
      WScript.StdOut.WriteLine( Txt );

      IISF.CloseItemStore( Handle );
      return RC;
   }

   var ClientHandle = IClient.RegisterClient( true );
   if (ClientHandle == 0xFFFFFFFF)
   {
      Txt = "Unable to register ISF client";
      WScript.StdOut.WriteLine( Txt );
      
      IISF.CloseItemStore( Handle );
      return RC;
   }

   var IConfig = IClient.ConfigureClient( ClientHandle );
   if (IConfig == null)
   {
      Txt = "Unable to configure ISF client";
      WScript.StdOut.WriteLine( Txt );

      IClient.UnregisterClient( ClientHandle );
      IISF.CloseItemStore( Handle );
      return RC;
   }

   Txt = "Processing ISF file...";
   WScript.StdOut.Write( Txt );

   // Configure the client for log 0x100E
   IConfig.AddLog( 0x100E );
   IConfig.CommitConfig();

   // Populate the client with all instances of log 0x100E
   IClient.PopulateClients();

   // Success/any items found?
   var ItemCount = IClient.GetClientItemCount( ClientHandle );
   if (ItemCount == 0)
   {
      Txt = "Unable to find required data for processing";
      WScript.StdOut.WriteLine( Txt );

      IClient.UnregisterClient( ClientHandle );
      IISF.CloseItemStore( Handle );
      return RC;
   }

   // Initialize array
   for (var r = MIN_BLOCKS; r <= MAX_BLOCKS; r += 2)
   {
      gErasures[r] = 0;
   }

   var MapMUX = new Array();
   MapMUX[0] = 0;
   MapMUX[1] = 1;
   MapMUX[2] = 1;
   MapMUX[3] = 1;
   MapMUX[4] = 1;
   MapMUX[5] = 0;
   MapMUX[6] = 0;
   MapMUX[7] = 0;
   MapMUX[8] = 2;
   MapMUX[9] = 2;
   MapMUX[10] = 2;
   MapMUX[11] = 2;
   MapMUX[12] = 1;
   MapMUX[13] = 2;
   MapMUX[14] = 3;
   MapMUX[15] = 0;

   // Process all items in the client
   for (var ItemIndex = 0; ItemIndex < ItemCount; ItemIndex++)
   {
      var Item = IClient.GetClientItem( ClientHandle, ItemIndex );
      if (Item == null)
      {
         continue;
      }

      var Fields = Item.GetConfiguredItemFields( "", false, false );
      if (Fields == null)
      {
         continue;
      }

      var FieldCount = Fields.GetFieldCount();
      if (FieldCount < 1)
      {
         continue;
      }

      var FI = 0;
      var NumEntries = Fields.GetFieldValue( FI++ );
      for (var n = 0; n < NumEntries; n++, FI += 3)
      {
         var ExpectedRate = Fields.GetFieldValue( FI );
         if (ExpectedRate == 0xC || ExpectedRate == 0xD || ExpectedRate == 0xF)
         {
            continue;
         }

         var MUXNumber = MapMUX[ExpectedRate];
         if (MUXNumber > 2 || (ExpectedRate > 7 && MUXNumber == 0))
         {
            continue;
         }

         var ActualRate = Fields.GetFieldValue( FI + 1 );
         if (MUXNumber == 2)
         {
            ActualRate += 16;
         }

         var Erased = false;
         if (ActualRate == 8 || ActualRate == 9 || ActualRate == 25)
         {
            Erased = true;
         }

         if (ActualRate < 26)
         {
            gCurrentTotal++;

            if (Erased)
            {
               gCurrentError++;
            }
         }

         if (gCurrentTotal == 500)
         {
            gSamples++;

            var PercentError = gCurrentError / gCurrentTotal * 100.0;
            PercentError *= 10;
            PercentError = PercentError.toFixed( 0 );
            gErasures[PercentError] += 1;

            gCurrentTotal = 0;
            gCurrentError = 0;
         }
      }
   }

   Txt = "Done";
   WScript.StdOut.WriteLine( Txt );

   if (gSamples == 0)
   {
      Txt = "Unable to find required data for processing";
      WScript.StdOut.WriteLine( Txt );

      return RC;
   }

   IClient.UnregisterClient( ClientHandle );
   IISF.CloseItemStore( Handle );

   RC = true;
   return RC;
}

// Generate an Excel spreadsheet with the analysis results
function GenerateExcelSpreadsheet()
{
   // Assume failure
   var RC  = false;
   var Txt = "";

   // Start Excel and get automation object
   var XL = new ActiveXObject( "Excel.Application" );
   if (XL == null)
   {
      Txt = "Error launching Excel";
      WScript.StdOut.WriteLine( Txt );

      return RC;
   }

   // Get a new workbook
   var WB = XL.Workbooks.Add();
   if (WB == null)
   {
      Txt = "Error interfacing to Excel";
      WScript.StdOut.WriteLine( Txt );

      return RC;
   }

   WB.title = "CDMA Forward Erasure Rate";

   try
   {
      WB.Sheets( 3 ).Delete();
      WB.Sheets( 2 ).Delete();
   }
   catch (Err) { };

   // Populate Excel workspace sheet
   var Sheet = WB.ActiveSheet;
   if (Sheet == null)
   {
      Txt = "Error interfacing to Excel";
      WScript.StdOut.WriteLine( Txt );

      WB.Close();
      return RC;
   }

   Sheet.Name = "Data";

   Txt = "Generating Excel spreadsheet...";
   WScript.StdOut.Write( Txt );

   // Populate Excel spreadsheet
   RC = PopulateExcelSpreadsheet( Sheet );
   if (RC == false)
   {
      Txt = "Error";
      WScript.StdOut.WriteLine( Txt );

      WB.Close();
      return RC; 
   }

   Txt = "Done";
   WScript.StdOut.WriteLine( Txt );

   // Save the work book file
   WB.SaveAs( XLSAbsolutePath );
   WB.Close();

   Txt = "Excel file saved at:\n";
   Txt += XLSAbsolutePath;
   WScript.StdOut.WriteLine( Txt );
}

// Populate Excel spreadsheet with analysis data
function PopulateExcelSpreadsheet( Sheet )
{
   // Assume failure
   var RC = false;

   Sheet.Cells( 1, 1 ).Value = "Total Samples";
   Sheet.Cells( 1, 1 ).Font.Bold = true;
   Sheet.Cells( 1, 1 ).ColumnWidth = 14;
   Sheet.Cells( 1, 2 ).Value = gSamples;

   Sheet.Cells( 2, 1 ).Value = "Blocks";
   Sheet.Cells( 2, 2 ).Value = "Blocks Total";
   Sheet.Cells( 2, 3 ).Value = "Blocks %";

   Sheet.Range( "A2:C2" ).Font.Bold = true;
   Sheet.Range( "A2:C2" ).ColumnWidth = 16;

   var r;
   var Index;
   var e = 0.0;
   var ErasureTotal = 0;
   for (r = MIN_BLOCKS, Index = 0; r <= MAX_BLOCKS; r += 2, e += 0.2, Index++)
   {
      Sheet.Cells( Index + 3, 1 ).Value = e;

      ErasureTotal += gErasures[r];
      Sheet.Cells( Index + 3, 2 ).Value = gErasures[r];
   }

   Index = 0;
   var Percentage;
   for (var r = MIN_BLOCKS, Index = 0; r <= MAX_BLOCKS; r += 2, Index++)
   {
      Percentage = gErasures[r] / ErasureTotal * 100.0;
      Sheet.Cells( Index + 3, 3 ).Value = Percentage;
   }

   var Range = Sheet.Range( "C2:C103" );
   if (Range == null)
   {
      return RC;
   }

   var Chart = Sheet.Parent.Charts.Add();
   if (Chart == null)
   {
      return RC;
   }

   Chart.ChartWizard( Range,                       // Source
                      4,                           // Gallery is xlLine
                      null,                        // Format
                      2,                           // Plot by column (2)
                      0,                           // Category labels
                      1,                           // Series labels
                      true,                        // Has legend ?
                      "CDMA Forward Erasure Rate", // Title
                      "Blocks",                    // Category tilte
                      "Percentage (%)",            // Value title
                      null );                      // Extra title

   // Setup a nice background
   Chart.PlotArea.Fill.TwoColorGradient( 4, 1 );
   Chart.PlotArea.Fill.ForeColor.SchemeColor = 37;
   Chart.PlotArea.Fill.BackColor.SchemeColor = 2;

   // Disable markers
   Chart.SeriesCollection(1).MarkerStyle = 0; // xlNone

   // XValues is X-axis label values
   Range = Sheet.Range( "A3:A103" );
   if (Range != null)
   {
      Chart.SeriesCollection( 1 ).XValues = Range;
   }

   // Success!
   RC = true;
   return RC;
}

// Main body of script
function Execute()
{
   // Parse out arguments
   var RC = ParseArguments();
   if (RC == false)
   {
      return;
   }

   // Initialize ISF automation interface
   RC = Initialize();
   if (RC == false)
   {
      return;
   }

   // Obtain erasure rate data from ISF file
   RC = Analyze();
   if (RC == false)
   {
      return;
   }

   // Generate an Excel spreadsheet with the analysis results
   GenerateExcelSpreadsheet();
}

Execute();