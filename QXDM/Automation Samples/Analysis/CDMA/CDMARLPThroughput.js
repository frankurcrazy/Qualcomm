// NOTE: This script must be run from CScript in a command box,
// i.e.  CScript CDMARLPThroughput.js <ISF File Name> [Excel File Name]

// This example demonstrates the usage of DM core automation
// interface and excel automation interface to plot
// CDMA RLP rx/tx throughput histogram

var MIN_KBPS        = 0;
var MAX_KBPS        = 30;

// Global variables
var IISF            = null;
var gLastTS         = 0;
var gSamples        = 0;
var gRXBytes        = new Number();
var gTXBytes        = new Number();
var gRXBytesArray   = new Array();
var gTXBytesArray   = new Array();

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
      "Syntax: CScript CDMARLPThroughput.js <ISF File Name> [Excel File Name]\n"
    + "Eg:     CScript CDMARLPThroughput.js \"CDMA RLP.isf\" \"CDMA RLP.xls\"\n";

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

// Perform analysis (obtain rlp throughput from ISF file)
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

   // Configure the client for log 0x1031
   IConfig.AddLog( 0x1031 );
   IConfig.CommitConfig();

   // Populate the client with all instances of log 0x1031
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
   for (var r = MIN_KBPS; r <= MAX_KBPS; r += 1)
   {
      gRXBytesArray[r] = 0;
      gTXBytesArray[r] = 0;
   }

   // Process all items in the client
   for (var ItemIndex = 0; ItemIndex < ItemCount; ItemIndex++)
   {
      var Item = IClient.GetClientItem( ClientHandle, ItemIndex );
      if (Item == null)
      {
         continue;
      }

      var Fields = Item.GetConfiguredItemFields( "", true, false );
      if (Fields == null)
      {
         continue;
      }

      var FieldCount = Fields.GetFieldCount();
      if (FieldCount < 25)
      {
         continue;
      }

      gSamples++;

      var RXBytes = Fields.GetFieldValueText( 16 );
      RXBytes = new Number( RXBytes );

      var TXBytes = Fields.GetFieldValueText( 23 );
      TXBytes = new Number( TXBytes );

      var CurrentTS = Item.GetItemSpecificTimestamp();
      CurrentTS = new Date( CurrentTS );

      // First item?
      if (gLastTS == 0)
      {
         gLastTS = CurrentTS;

         gRXBytes = RXBytes;
         gTXBytes = TXBytes;
      }
      else if (gLastTS >= CurrentTS)
      {
         return RC;
      }

      var DeltaMS = CurrentTS.getTime() - gLastTS.getTime();
      if (DeltaMS == 0)
      {
         continue;
      }

      // Make sure we have a valid delta for bytes
      if (RXBytes < gRXBytes)
      {
         gRXBytes = RXBytes;
      }

      if (TXBytes < gTXBytes)
      {
         gTXBytes = TXBytes;
      }

      // RX KB/s
      var DeltaRXBytes = RXBytes - gRXBytes;
      DeltaRXBytes = ((1000.0 * DeltaRXBytes) / DeltaMS) / 1000.0;
      DeltaRXBytes = Math.round( DeltaRXBytes );

      if (DeltaRXBytes >= MIN_KBPS && DeltaRXBytes <= MAX_KBPS)
      {
         gRXBytesArray[DeltaRXBytes] += 1;
      }

      // TX KB/s
      var DeltaTXBytes = TXBytes - gTXBytes;
      DeltaTXBytes = ((1000.0 * DeltaTXBytes) / DeltaMS) / 1000.0;
      DeltaTXBytes = Math.round( DeltaTXBytes );

      if (DeltaTXBytes >= MIN_KBPS && DeltaTXBytes <= MAX_KBPS)
      {
         gTXBytesArray[DeltaTXBytes] += 1;
      }

      // Get ready for the next pass
      gLastTS = CurrentTS;
      gRXBytes = RXBytes;
      gTXBytes = TXBytes;
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

   WB.title = "CDMA RLP RX/TX Throughput";

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

   Sheet.Cells( 2, 1 ).Value = "KBps";
   Sheet.Cells( 2, 2 ).Value = "RX KBps Total";
   Sheet.Cells( 2, 3 ).Value = "RX KBps %";
   Sheet.Cells( 2, 4 ).Value = "TX KBps Total";
   Sheet.Cells( 2, 5 ).Value = "TX KBps %";

   Sheet.Range( "A2:E2" ).Font.Bold = true;
   Sheet.Range( "A2:E2" ).ColumnWidth = 16;

   var r;
   var Index;
   var Percentage;
   for (r = MIN_KBPS, Index = 0; r <= MAX_KBPS; r += 1, Index++)
   {
      Sheet.Cells( Index + 3, 1 ).Value = r;

      Sheet.Cells( Index + 3, 2 ).Value = gRXBytesArray[r];

      Percentage = gRXBytesArray[r] / gSamples * 100.0;
      Sheet.Cells( Index + 3, 3 ).Value = Percentage;

      Sheet.Cells( Index + 3, 4 ).Value = gTXBytesArray[r];

      Percentage = gTXBytesArray[r] / gSamples * 100.0;
      Sheet.Cells( Index + 3, 5 ).Value = Percentage;
   }

   var Range = Sheet.Range( "C2:C33, E2:E33" );
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
                      "CDMA RLP RX/TX Throughput", // Title
                      "KBps",                      // Category tilte
                      "Percentage (%)",            // Value title
                      null );                      // Extra title

   // Setup a nice background
   Chart.PlotArea.Fill.TwoColorGradient( 4, 1 );   
   Chart.PlotArea.Fill.ForeColor.SchemeColor = 37;
   Chart.PlotArea.Fill.BackColor.SchemeColor = 2;

   // Disable markers
   Chart.SeriesCollection(1).MarkerStyle = 0; // xlNone
   Chart.SeriesCollection(2).MarkerStyle = 0; // xlNone

   // XValues is X-axis label values
   Range = Sheet.Range( "A3:A33" );
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

   // Obtain rlp throughput from ISF file
   RC = Analyze();
   if (RC == false)
   {
      return;
   }

   // Generate an Excel spreadsheet with the analysis results
   GenerateExcelSpreadsheet();
}

Execute();