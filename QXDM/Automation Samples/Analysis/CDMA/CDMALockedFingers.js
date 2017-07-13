// NOTE: This script must be run from CScript in a command box,
// i.e.  CScript CDMALockedFingers.js <ISF File Name> [Excel File Name]

// This example demonstrates the usage of DM core automation
// interface and excel automation interface to plot
// CDMA locked fingers histogram

// Maximum number of fingers we support
var MAX_FINGERS        = 6;

// Global variables
var IISF               = null;
var gSamples           = 0;
var gLockedGood        = new Array();
var gLockedStrong      = new Array();
var gLockedVeryStrong  = new Array();
var gLockedFingerArray = new Array();

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
      "Syntax: CScript CDMALockedFingers.js <ISF File Name> [Excel File Name]\n"
    + "Eg:     CScript CDMALockedFingers.js \"CDMA Finger.isf\" \"CDMA Finger.xls\"\n";

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

// Perform analysis (obtain locked fingers data from ISF file)
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
   IConfig.AddLog( 0x119A );
   IConfig.AddLog( 0x119B );
   IConfig.AddLog( 0x119C );
   IConfig.AddLog( 0x119D );
   IConfig.AddLog( 0x119E );
   IConfig.AddLog( 0x119F );
   IConfig.AddLog( 0x11A0 );
   IConfig.AddLog( 0x11A1 );
   IConfig.AddLog( 0x11A2 );
   IConfig.AddLog( 0x11A3 );

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
      gLockedGood[Finger] = 0;
      gLockedStrong[Finger] = 0;
      gLockedVeryStrong[Finger] = 0;
      gLockedFingerArray[Finger] = 0;
   }

   // No need to repeatedly compute this
   var Den = 64.0 * 64.0 * 18.0;

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

      var MaxFieldIndex = Fields.GetFieldCount();
      if (--MaxFieldIndex < 2)
      {
         continue;
      }

      var FI = 1;
      var NumPackets = Fields.GetFieldValue( FI );
      for (var n = 0; n < NumPackets; n++)
      {
         // Index for "ID" field
         FI = Fields.GetFieldIndexFromByID( 21003, ++FI, false );
         if (FI == 0xFFFFFFFF)
         {
            break;
         }

         if (MaxFieldIndex < FI + 6)
         {
            continue;
         }

         // Finger status subpacket?
         var ID = Fields.GetFieldValue( FI );
         if (ID != 4)
         {
            continue;
         }

         // A version we recognize?
         var Version = Fields.GetFieldValue( FI + 1 );
         if (Version != 1)
         {
            continue;
         }

         // Number of fingers
         var FingCount = Fields.GetFieldValue( FI + 6 );
         if (FingCount > MAX_FINGERS)
         {
            FingCount = MAX_FINGERS;
         }

         if ( (FingCount == 0)
         ||   (MaxFieldIndex < (FI + (6 + (FingCount * 38)))) )
         {
            continue;
         }

         // Compute pilot filter gain factor
         var PFRaw = Fields.GetFieldValue( FI + 3 );
         var PF = PFRaw / 128.0;
         PF = PF / (64.0 * (2.0 - PF));

         gSamples++;

         var Good = 0;
         var Strong = 0;
         var LockedFing = 0;
         var VeryStrong = 0;

         // Start of finger record
         FI += 7;

         // Process each finger record
         for (var Finger = 0; Finger < FingCount; Finger++, FI += 38)
         {
            var PN = Fields.GetFieldValue( FI );
            if (PN == 0xFFFF)
            {
               continue;
            }

            var Assigned = Fields.GetFieldValue( FI + 30 );
            if (Assigned != 1)
            {
               continue;
            }

            var Locked = Fields.GetFieldValue( FI + 31 );
            if (Locked != 1)
            {
               continue;
            }

            LockedFing++;

            var RSSI = Fields.GetFieldValue( FI + 1 );
            if (RSSI <= 0)
            {
               continue;
            }

            // Convert RSSI value to dB
            RSSI = RSSI / Den;
            RSSI -= PF;

            if (RSSI < 0.00001)
            {
               RSSI = 0.00001;
            }

            RSSI = 10.0 * Math.LOG10E * Math.log( RSSI );

            // Good signal strength
            if (RSSI >= -13.0)
            {
               Good++;
            }

            // Strong signal strength
            if (RSSI >= -10.0)
            {
               Strong++;
            }

            // Very strong signal strength
            if (RSSI >= -7.0)
            {
               VeryStrong++;
            }
         }

         gLockedGood[Good] += 1;
         gLockedStrong[Strong] += 1;
         gLockedVeryStrong[VeryStrong] += 1;
         gLockedFingerArray[LockedFing] += 1;
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

   WB.title = "CDMA Locked Fingers Data";

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

   Sheet.Cells( 2, 1 ).Value = "Locked Fingers";
   Sheet.Cells( 2, 2 ).Value = "Fingers Locked Total";
   Sheet.Cells( 2, 3 ).Value = "Fingers Locked  %";
   Sheet.Cells( 2, 4 ).Value = "Good Fingers Total";
   Sheet.Cells( 2, 5 ).Value = "Good Fingers %";
   Sheet.Cells( 2, 6 ).Value = "Strong Fingers Total";
   Sheet.Cells( 2, 7 ).Value = "Strong Fingers %";
   Sheet.Cells( 2, 8 ).Value = "Very Strong Fingers Total";
   Sheet.Cells( 2, 9 ).Value = "Very Strong Fingers %";

   Sheet.Range( "A2:G2" ).Font.Bold = true;
   Sheet.Range( "B2:G2" ).ColumnWidth = 20;
   Sheet.Range( "H2:I2" ).Font.Bold = true;
   Sheet.Range( "H2:I2" ).ColumnWidth = 24;

   var GoodTotal = 0;
   var StrongTotal = 0;
   var LockedTotal = 0;
   var VeryStrongTotal = 0;
   for (var Finger = 0; Finger <= MAX_FINGERS; Finger++)
   {
      Sheet.Cells( Finger + 3, 1 ).Value = Finger;

      GoodTotal += gLockedGood[Finger];
      StrongTotal += gLockedStrong[Finger];
      LockedTotal += gLockedFingerArray[Finger];
      VeryStrongTotal += gLockedVeryStrong[Finger];
   }

   var Percentage;
   for (var Finger = 0; Finger <= MAX_FINGERS; Finger++)
   {
      Sheet.Cells( Finger + 3, 2 ).Value = gLockedFingerArray[Finger];

      Percentage = (gLockedFingerArray[Finger] / LockedTotal) * 100.0;
      Sheet.Cells( Finger + 3, 3 ).Value = Percentage;

      Sheet.Cells( Finger + 3, 4 ).Value = gLockedGood[Finger];

      Percentage = (gLockedGood[Finger] / GoodTotal) * 100.0;
      Sheet.Cells( Finger + 3, 5 ).Value = Percentage;

      Sheet.Cells( Finger + 3, 6 ).Value = gLockedStrong[Finger];

      Percentage = (gLockedStrong[Finger] / StrongTotal) * 100.0;
      Sheet.Cells( Finger + 3, 7 ).Value = Percentage;

      Sheet.Cells( Finger + 3, 8 ).Value = gLockedVeryStrong[Finger];

      Percentage = (gLockedVeryStrong[Finger] / VeryStrongTotal) * 100.0;
      Sheet.Cells( Finger + 3, 9 ).Value = Percentage;
   }

   var Range = Sheet.Range( "C2:C9, E2:E9, G2:G9, I2:I9" );
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
   Chart.ChartTitle.Characters.Text = "CDMA Locked Fingers";
   Chart.Axes( 1, 1 ).AxisTitle.Characters.Text = "Locked Fingers";
   Chart.Axes( 2, 1 ).AxisTitle.Characters.Text = "Percentage (%)";

   // XValues is X-axis label values
   Range = Sheet.Range( "A3:A9" );
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

   // Obtain locked fingers data from ISF file
   RC = Analyze();
   if (RC == false)
   {
      return;
   }

   // Generate an Excel spreadsheet with the analysis results
   GenerateExcelSpreadsheet();
}

Execute();