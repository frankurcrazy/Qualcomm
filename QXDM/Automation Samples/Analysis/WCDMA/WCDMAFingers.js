// NOTE: This script must be run from CScript in a command box,
// i.e.  CScript WCDMAFingers.js <ISF File Name> [Excel File Name]

// This example demonstrates the usage of DM core automation
// interface and excel automation interface to plot
// WCDMA fingers histogram

// Maximum number of fingers we support
var MAX_FINGERS      = 12;

// Global variables
var IISF             = null;
var gSamples         = 0;
var gLockedFingers   = new Array();
var gAssignedFingers = new Array();

// ISF/Excel fully qualified paths
var ISFAbsolutePath  = "";
var XLSAbsolutePath  = "";

// Process the argument - ISF file name
function ParseArguments()
{
   // Assume failure
   var RC = false;
   var Txt = "";
   var Help =
      "Syntax: CScript WCDMAFingers.js <ISF File Name> [Excel File Name]\n"
    + "Eg:     CScript WCDMAFingers.js \"WCDMA Fingers.isf\" \"WCDMA Fingers.xls\"\n";

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

// Perform analysis (obtain fingers data from ISF file)
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
   IConfig.AddLog( 0x4003 );
   IConfig.AddLog( 0x4006 );
   IConfig.AddLog( 0x4016 );
   IConfig.AddLog( 0x4202 );

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
   for (var Finger = 0; Finger <= MAX_FINGERS; Finger++)
   {
      gLockedFingers[Finger] = 0;
      gAssignedFingers[Finger] = 0;
   }

   // Initialize array of log keys to field offsets
   var Offsets = new Array();
   Offsets["[0x4003]"] = 18;
   Offsets["[0x4006]"] = 33;
   Offsets["[0x4016]"] = 39;
   Offsets["[0x4202]"] = 23;

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
      if (FieldCount < 11)
      {
         continue;
      }

      gSamples++;

      // Index to start search for index of "Number Of Fingers" field
      var FieldIndex = 3;
      FieldIndex = Fields.GetFieldIndexFromByID( 302826, FieldIndex, false );
      if (FieldIndex == 0xFFFFFFFF)
      {
         continue;
      }

      // Number of fingers
      var FingCount = Fields.GetFieldValue( FieldIndex );
      if (FingCount > MAX_FINGERS)
      {
         FingCount = MAX_FINGERS;
      }

      gAssignedFingers[FingCount] += 1;

      // Index to "Data Combining Lock" field
      FieldIndex += 4;

      var ItemKey = Item.GetItemKeyText();

      var FO = Offsets[ItemKey];
      var LockedFing = 0;
      for (var Finger = 0; Finger < FingCount; Finger++, FieldIndex += FO)
      {
         var FingLock = Fields.GetFieldValue( FieldIndex );
         if (FingLock == 1)
         {
            LockedFing++;
         }
      }

      gLockedFingers[LockedFing] += 1;
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

   WB.title = "WCDMA Finger Data";

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

   Sheet.Cells( 2, 1 ).Value = "Fingers";
   Sheet.Cells( 2, 2 ).Value = "Fingers Locked Total";
   Sheet.Cells( 2, 3 ).Value = "Fingers Locked %";
   Sheet.Cells( 2, 4 ).Value = "Fingers Assigned Total";
   Sheet.Cells( 2, 5 ).Value = "Fingers Assigned %";
   Sheet.Range( "A2:E2" ).Font.Bold = true;
   Sheet.Range( "B2:E2" ).ColumnWidth = 22;

   var Finger;
   var LockedTotal = 0;
   var AssignedTotal = 0;
   for (Finger = 0; Finger <= MAX_FINGERS; Finger++)
   {
      Sheet.Cells( Finger + 3, 1 ).Value = Finger;

      LockedTotal += gLockedFingers[Finger];
      AssignedTotal += gAssignedFingers[Finger];
   }

   var Percentage;
   for (Finger = 0; Finger <= MAX_FINGERS; Finger++)
   {
      Sheet.Cells( Finger + 3, 4 ).Value = gAssignedFingers[Finger];

      Percentage = gAssignedFingers[Finger] / AssignedTotal * 100.0;
      Sheet.Cells( Finger + 3, 5 ).Value = Percentage;

      Sheet.Cells( Finger + 3, 2 ).Value = gLockedFingers[Finger];

      Percentage = gLockedFingers[Finger] / LockedTotal * 100.0;
      Sheet.Cells( Finger + 3, 3 ).Value = Percentage;
   }

   var Range = Sheet.Range( "C2:C15, E2:E15" );
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
   Chart.ChartTitle.Characters.Text = "WCDMA Fingers";
   Chart.Axes( 1, 1 ).AxisTitle.Characters.Text = "Fingers";
   Chart.Axes( 2, 1 ).AxisTitle.Characters.Text = "Percentage (%)";

   // XValues is X-axis label values
   Range = Sheet.Range( "A3:A15" );
   if (Range != null)
   {
      Chart.SeriesCollection(1).XValues = Range
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

   // Obtain fingers data from ISF file
   RC = Analyze();
   if (RC == false)
   {
      return;
   }

   // Generate an Excel spreadsheet with the analysis results
   GenerateExcelSpreadsheet();
}

Execute();