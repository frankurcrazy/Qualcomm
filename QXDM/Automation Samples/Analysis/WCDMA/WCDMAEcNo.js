// NOTE: This script must be run from CScript in a command box,
// i.e.  CScript WCDMAEcNo.js <ISF File Name> [Excel File Name]

// This example demonstrates the usage of DM core automation
// interface and excel automation interface to plot
// WCDMA EcNo histogram

var MIN_ENERGY      = -20;
var MAX_ENERGY      = 0;

// Global variables
var IISF            = null;
var gAllSamples     = 0;
var gCampedSamples  = 0;
var gAllEnergy      = new Array();
var gCampedEnergy   = new Array();

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
      "Syntax: CScript WCDMAEcNo.js <ISF File Name> [Excel File Name]\n"
    + "Eg:     CScript WCDMAEcNo.js \"WCDMA EcNo.isf\" \"WCDMA EcNo.xls\"\n";

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

// Perform analysis (obtain cell energy data from ISF file)
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

   // Configure the client for supported log keys
   IConfig.AddLog( 0x4017 );
   IConfig.AddLog( 0x413F );
   IConfig.CommitConfig();

   // Populate the client with all instances of supported logs
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
   for (var c = MIN_ENERGY; c <= MAX_ENERGY; c++)
   {
      gAllEnergy[c] = 0;
      gCampedEnergy[c] = 0;
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
      if (FieldCount < 2)
      {
         continue;
      }

      // Number of specified tasks
      var TasksCount = Fields.GetFieldValue( 1 );
      if (TasksCount <= 0)
      {
         continue;
      }

      var FieldCount = Fields.GetFieldCount();
      if (FieldCount < 2 + (TasksCount * 19))
      {
         continue;
      }

      var BestAll = -1000.0;
      var BestCamped = -1000.0;

      // Process each task computing combined energy
      var FI = 2;
      var FO = TasksCount * 10;
      for (var t = 0; t < TasksCount; t++, FI += 10, FO += 9)
      {
         var CellSet = Fields.GetFieldValue( FI + 5 );

         var N = Fields.GetFieldValue( FI );
         var M = Fields.GetFieldValue( FI + 1 );
         if (N == 0 || M == 0)
         {
            continue;
         }

         var Sum = Fields.GetFieldValue( FO + 6 );
         Sum += Fields.GetFieldValue( FO + 7 );
         Sum += Fields.GetFieldValue( FO + 8 );
         Sum += Fields.GetFieldValue( FO + 9 );

         var Num = Sum - (0.1406 * M * N);
         var Den = 0.1406 * M * N * N;

         var Tmp = Num / Den;
         if (Tmp <= 0)
         {
            continue;
         }

         var Energy = 10.0 * Math.LOG10E * Math.log( Tmp );

         // Camped?
         if (CellSet == 0)
         {
            if (Energy > BestCamped)
            {
               BestCamped = Energy;
            }
         }

         if (Energy > BestAll)
         {
            BestAll = Energy;
         }
      }

      BestAll = Math.round( BestAll );
      BestCamped = Math.round( BestCamped );

      if (BestAll >= MIN_ENERGY && BestAll <= MAX_ENERGY)
      {
         gAllSamples++;
         gAllEnergy[BestAll] += 1;
      }

      if (BestCamped >= MIN_ENERGY && BestCamped <= MAX_ENERGY)
      {
         gCampedSamples++;
         gCampedEnergy[BestCamped] += 1;
      }
   }

   Txt = "Done";
   WScript.StdOut.WriteLine( Txt );

   if (gAllSamples == 0 || gCampedSamples == 0)
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

   try
   {
      WB.Sheets( 3 ).Delete();
      WB.Sheets( 2 ).Delete();
   }
   catch (Err) { };

   WB.title = "WCDMA Ec/No";

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

   Sheet.Cells( 1, 1 ).Value = "Camped Cell Samples";
   Sheet.Cells( 1, 1 ).Font.Bold = true;
   Sheet.Cells( 1, 2 ).Value = gCampedSamples;

   Sheet.Cells( 2, 1 ).Value = "Best Cell Samples";
   Sheet.Cells( 2, 1 ).Font.Bold = true;
   Sheet.Cells( 2, 2 ).Value = gAllSamples;

   Sheet.Cells( 3, 1 ).Value = "Energy";
   Sheet.Cells( 3, 2 ).Value = "Camped Cell Total";
   Sheet.Cells( 3, 3 ).Value = "Camped Cell %";
   Sheet.Cells( 3, 4 ).Value = "Best Cell Total";
   Sheet.Cells( 3, 5 ).Value = "Best Cell %";
   Sheet.Range( "A3:E3" ).Font.Bold = true;
   Sheet.Range( "A3:E3" ).ColumnWidth = 18;

   var Index = 0;
   var Energy;
   var Percentage;
   for (var Energy = MIN_ENERGY; Energy <= MAX_ENERGY; Energy++, Index++)
   {
      Sheet.Cells( Index + 4, 1 ).Value = Energy;
      Sheet.Cells( Index + 4, 2 ).Value = gCampedEnergy[Energy];

      Percentage = gCampedEnergy[Energy] / gCampedSamples * 100.0;
      Sheet.Cells( Index + 4, 3 ).Value = Percentage;

      Sheet.Cells( Index + 4, 4 ).Value = gAllEnergy[Energy];

      Percentage = gAllEnergy[Energy] / gAllSamples * 100.0;
      Sheet.Cells( Index + 4, 5 ).Value = Percentage;
   }

   var Range = Sheet.Range( "C3:C24, E3:E24" );
   if (Range == null)
   {
      return RC;
   }

   var Chart = Sheet.Parent.Charts.Add();
   if (Chart == null)
   {
      return RC;
   }

   Chart.ChartType = 51;              // xlColumnClustered
   Chart.SetSourceData( Range, 2 );   // xlColumns
   Chart.Location( 1, "Chart" );      // xlLocationAsNewSheet

   // Setup a nice background
   Chart.PlotArea.Fill.TwoColorGradient( 4, 1 );
   Chart.PlotArea.Fill.ForeColor.SchemeColor = 37;
   Chart.PlotArea.Fill.BackColor.SchemeColor = 2;

   // Set titles
   Chart.HasTitle = true;
   Chart.Axes( 1, 1 ).HasTitle = true;
   Chart.Axes( 2, 1 ).HasTitle = true;
   Chart.ChartTitle.Characters.Text = "WCDMA Ec/No";
   Chart.Axes( 1, 1 ).AxisTitle.Characters.Text = "Combined Energy (dB)";
   Chart.Axes( 2, 1 ).AxisTitle.Characters.Text = "Percentage (%)";

   // XValues is X-axis label values
   Range = Sheet.Range( "A4:A24" );
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

   // Obtain cell energy data from ISF file
   RC = Analyze();
   if (RC == false)
   {
      return;
   }

   // Generate an Excel spreadsheet with the analysis results
   GenerateExcelSpreadsheet();
}

Execute();