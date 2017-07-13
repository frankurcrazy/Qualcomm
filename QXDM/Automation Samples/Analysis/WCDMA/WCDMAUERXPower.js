// NOTE: This script must be run from CScript in a command box,
// i.e.  CScript WCDMAUERXPower.js <ISF File Name> [Excel File Name]

// This example demonstrates the usage of DM core automation
// interface and excel automation interface to plot
// WCDMA UE rx power histogram

var MIN_POWER = -110;
var MAX_POWER = -20;

// Global variables
var IISF        = null;
var gRX0Samples = 0;
var gRX1Samples = 0;
var gRX0Power   = new Array();
var gRX1Power   = new Array();

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
      "Syntax: CScript WCDMAUERXPower.js <ISF File Name> [Excel File Name]\n"
    + "Eg:     CScript WCDMAUERXPower.js \"WCDMA AGC.isf\" \"WCDMA AGC.xls\"\n";

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

// Perform analysis (obtain rx power data from ISF file)
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

   // Configure the client for log 0x4015
   IConfig.AddLog( 0x4015 );
   IConfig.CommitConfig();

   // Populate the client with all instances of log 0x4015
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
   for (var r = MIN_POWER; r <= MAX_POWER; r++)
   {
      gRX0Power[r] = 0;
      gRX1Power[r] = 0;
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
      if (FieldCount < 3)
      {
         continue;
      }

      // Number of samples
      var SamplesCount = Fields.GetFieldValue( 0 );

      // Index of field "RX AGC"
      var FieldIndex = 2;

      for (var s = 0; s < SamplesCount; s++, FieldIndex += 14)
      {
         var RX0 = Fields.GetFieldValue( FieldIndex );
         var RX1 = Fields.GetFieldValue( FieldIndex + 5 );

         var RX0Active = Fields.GetFieldValue( FieldIndex + 12 );
         var RX1Active = Fields.GetFieldValue( FieldIndex + 11 );

         if (RX0 >= -512 && RX0 <= 511 && RX0Active != 0)
         {
            RX0 = -106.0 + ((RX0 + 512.0) / 12.0);
            RX0 = Math.round( RX0 );

            if (RX0 >= MIN_POWER && RX0 <= MAX_POWER)
            {
               gRX0Samples++;
               gRX0Power[RX0] += 1;
            }
         }

         if (RX1 >= -512 && RX1 <= 511 && RX1Active != 0)
         {
            RX1 = -106.0 + ((RX1 + 512.0) / 12.0);
            RX1 = Math.round( RX1 );

            if (RX1 >= MIN_POWER && RX1 <= MAX_POWER)
            {
               gRX1Samples++;
               gRX1Power[RX1] += 1;
            }
         }
      }
   }

   Txt = "Done";
   WScript.StdOut.WriteLine( Txt );

   if (gRX0Samples == 0)
   {
      Txt = "Unable to find required data for processing";
      WScript.StdOut.WriteLine( Txt );

      return RC;
   }

   // Diversity might not be enabled
   if (gRX1Samples == 0)
   {
      gRX1Samples == 1;
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

   WB.title = "WCDMA UE RX Power";

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

   Sheet.Cells( 1, 1 ).Value = "Total RX0 Samples";
   Sheet.Cells( 1, 1 ).Font.Bold = true;
   Sheet.Cells( 1, 1 ).ColumnWidth = 14;
   Sheet.Cells( 1, 2 ).Value = gRX0Samples;

   Sheet.Cells( 2, 1 ).Value = "Total RX1 Samples";
   Sheet.Cells( 2, 1 ).Font.Bold = true;
   Sheet.Cells( 2, 1 ).ColumnWidth = 14;
   Sheet.Cells( 2, 2 ).Value = gRX1Samples;

   Sheet.Cells( 3, 1 ).Value = "Power (dB)";
   Sheet.Cells( 3, 2 ).Value = "RX 0 Power Total";
   Sheet.Cells( 3, 3 ).Value = "RX 0 Power %";
   Sheet.Cells( 3, 4 ).Value = "RX 1 Power Total";
   Sheet.Cells( 3, 5 ).Value = "RX 1 Power %";
   Sheet.Range( "A3:E3" ).Font.Bold = true;
   Sheet.Range( "B3:E3" ).ColumnWidth = 16;

   var r;
   var Index;
   var Percentage;
   for (r = MIN_POWER, Index = 0; r <= MAX_POWER; r++, Index++)
   {
      Sheet.Cells( Index + 4, 1 ).Value = r;

      Sheet.Cells( Index + 4, 2 ).Value = gRX0Power[r];

      Percentage = gRX0Power[r] / gRX0Samples * 100.0;
      Sheet.Cells( Index + 4, 3 ).Value = Percentage;

      Sheet.Cells( Index + 4, 4 ).Value = gRX1Power[r];

      Percentage = gRX1Power[r] / gRX1Samples * 100.0;
      Sheet.Cells( Index + 4, 5 ).Value = Percentage;
   }

   var Range = Sheet.Range( "C3:C94, E3:E94" );
   if (Range == null)
   {
      return RC;
   }

   var Chart = Sheet.Parent.Charts.Add();
   if (Chart == null)
   {
      return RC;
   }

   Chart.ChartWizard( Range,               // Source
                      4,                   // Gallery is xlLine
                      null,                // Format
                      2,                   // Plot by column (2)
                      0,                   // Category labels
                      1,                   // Series labels
                      true,                // Has legend ?
                      "WCDMA UE RX Power", // Title
                      "Power (dB)",        // Category tilte
                      "Percentage (%)",    // Value title
                      null );              // Extra title

   // Setup a nice background
   Chart.PlotArea.Fill.TwoColorGradient( 4, 1 );
   Chart.PlotArea.Fill.ForeColor.SchemeColor = 37;
   Chart.PlotArea.Fill.BackColor.SchemeColor = 2;

   // Disable markers
   Chart.SeriesCollection(1).MarkerStyle = 0; // xlNone
   Chart.SeriesCollection(2).MarkerStyle = 0; // xlNone

   // XValues is X-axis label values
   Range = Sheet.Range( "A4:A94" );
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

   // Obtain rx power data from ISF file
   RC = Analyze();
   if (RC == false)
   {
      return;
   }

   // Generate an Excel spreadsheet with the analysis results
   GenerateExcelSpreadsheet();
}

Execute();