// NOTE: This script must be run from CScript in a command box,
// i.e.  CScript HDRLoopPower.js <ISF File Name> [Excel File Name]

// This example demonstrates the usage of DM core automation
// interface and excel automation interface to plot
// HDR Loop power histogram

var MIN_POWER          = -60;
var MAX_POWER          = 40;

// Global variables
var IISF               = null;
var gSamples           = 0;
var gTXOpenLoopPower   = new Array();
var gTXClosedLoopPower = new Array();

// ISF/Excel fully qualified paths
var ISFAbsolutePath    = "";
var XLSAbsolutePath    = "";

// Process the argument - ISF file name
function ParseArguments()
{
   // Assume failure
   var RC = false;
   var Txt = "";
   var Help =
      "Syntax: CScript HDRLoopPower.js <ISF File Name> [Excel File Name]\n"
    + "Eg:     CScript HDRLoopPower.js \"HDR Power.isf\" \"HDR Power.xls\"\n";

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

// Perform analysis (obtain loop power data from ISF file)
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

   // Configure the client for log 0x1069
   IConfig.AddLog( 0x1069 );
   IConfig.CommitConfig();

   // Populate the client with all instances of log 0x1069
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

   // Initialize arrays
   for (var r = MIN_POWER; r <= MAX_POWER; r++)
   {
      gTXOpenLoopPower[r] = 0;
      gTXClosedLoopPower[r] = 0;
   }

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
      if (FieldCount < 18)
      {
         continue;
      }

      // "Power Amplifier State" field index
      var FieldIndex = 2;

      for (var Frame = 1; Frame <= 2; Frame++, FieldIndex += 9)
      {
         var PowerAmpState = Fields.GetFieldValue( FieldIndex );
         if (PowerAmpState != 1)
         {
            continue;
         }

         gSamples++;

         var OpenLoopPwr = Fields.GetFieldValue( FieldIndex + 1 );
         var ClosedLoopPwr = Fields.GetFieldValue( FieldIndex + 2 );

         // Convert to dBm and store
         OpenLoopPwr = OpenLoopPwr / 256.0;
         OpenLoopPwr = Math.round( OpenLoopPwr );
         if (OpenLoopPwr >= MIN_POWER && OpenLoopPwr <= MAX_POWER)
         {
            gTXOpenLoopPower[OpenLoopPwr] += 1;
         }

         ClosedLoopPwr = ClosedLoopPwr / 256.0;
         ClosedLoopPwr = Math.round( ClosedLoopPwr );
         if (ClosedLoopPwr >= MIN_POWER && ClosedLoopPwr <= MAX_POWER)
         {
            gTXClosedLoopPower[ClosedLoopPwr] += 1;
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

   WB.title = "HDR Loop Power";

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

   Sheet.Cells( 2, 1 ).Value = "Power (dBm)";
   Sheet.Cells( 2, 2 ).Value = "Open Loop Power Total";
   Sheet.Cells( 2, 3 ).Value = "Open Loop Power %";
   Sheet.Cells( 2, 4 ).Value = "Closed Loop Power Total";
   Sheet.Cells( 2, 5 ).Value = "Closed Loop Power %";
   Sheet.Range( "A2:E2" ).Font.Bold = true;
   Sheet.Range( "B2:E2" ).ColumnWidth = 24;

   var r;
   var Index;
   for (r = MIN_POWER, Index = 0; r <= MAX_POWER; r++, Index++)
   {
      Sheet.Cells( Index + 3, 1 ).Value = r;

      Sheet.Cells( Index + 3, 2 ).Value = gTXOpenLoopPower[r];
      Sheet.Cells( Index + 3, 4 ).Value = gTXClosedLoopPower[r];
   }

   var Percentage;
   for (r = MIN_POWER, Index = 0; r <= MAX_POWER; r++, Index++)
   {
      Percentage = gTXOpenLoopPower[r] / gSamples * 100.0;
      Sheet.Cells( Index + 3, 3 ).Value = Percentage;

      Percentage = gTXClosedLoopPower[r] / gSamples * 100.0;
      Sheet.Cells( Index + 3, 5 ).Value = Percentage;
   }

   var Range = Sheet.Range( "C2:C103, E2:E103" );
   if (Range == null)
   {
      return RC;
   }

   var Chart = Sheet.Parent.Charts.Add();
   if (Chart == null)
   {
      return RC;
   }

   Chart.ChartWizard( Range,            // Source
                      4,                // Gallery is xlLine
                      null,             // Format
                      2,                // Plot by column (2)
                      0,                // Category labels
                      1,                // Series labels
                      true,             // Has legend ?
                      "HDR Loop Power", // Title
                      "Power (dBm)",    // Category tilte
                      "Percentage (%)", // Value title
                      null );           // Extra title

   // Setup a nice background
   Chart.PlotArea.Fill.TwoColorGradient( 4, 1 );
   Chart.PlotArea.Fill.ForeColor.SchemeColor = 37;
   Chart.PlotArea.Fill.BackColor.SchemeColor = 2;

   // Disable markers
   Chart.SeriesCollection(1).MarkerStyle = 0; // xlNone
   Chart.SeriesCollection(2).MarkerStyle = 0; // xlNone

   // XValues is X-axis label values
   Range = Sheet.Range( "A3:A103" );
   if (Range != null)
   {
      Chart.SeriesCollection(1).XValues = Range;
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

   // Obtain loop power data from ISF file
   RC = Analyze();
   if (RC == false)
   {
      return;
   }

   // Generate an Excel spreadsheet with the analysis results
   GenerateExcelSpreadsheet();
}

Execute();