// DM Core Automation - Item Store Files Interface Example
//
// This example processes one or more ISF files and filters out the NMEA
// sentences of interest into a text file.
//
// NOTE: This script can be run one of two ways:
//    A. From a command line windows as argument of javascript interpreter
//       e.g. C:\WINDOWS\System32\CScript.exe C:\ISFExtractNMEA.js <Filter Mask> <ISF File>
//    B. From the "Item Store File Settings" dialog in QXDM, filling the
//       "Automatic ISF Post-Processing" section
//       i.e. command: C:\WINDOWS\syttem32\cscript.exe
//            arguments: <script_path>\ISFExtractNMEA.js <filter_mask>
//    Here, the filter mask is a bit mask with the following definition
//       0x01 = $GPGGA
//       0x02 = $GPGSA
//       0x04 = $GPGSV
//       0x08 = $GPRMC
//       0x10 = $GPVTG
//       0x20 = $PSTIP
//       0x40 = $PSTII

// Default value for the sentence filter mask
var SentenceFilterMask = 255;

// Process the arguments to create a list of files
function ParseArguments( bRecurse )
{
   var Txt;
   var TmpFiles = new Array();

   var Help = "Syntax: CScript ISFExtractNMEA.js <BitMask> <ISFFile>\n" +
              "e.g. CScript ISFExtractNMEA.js 0x7F Sample.isf\n" +
              "where 0x01 = $GPGGA\n" +
              "      0x02 = $GPGSA\n" +
              "      0x04 = $GPGSV\n" +
              "      0x08 = $GPRMC\n" +
              "      0x10 = $GPVTG\n" +
              "      0x20 = $PSTIP\n" +
              "      0x40 = $PSTII\n";

   // Grab the shell
   var SH = new ActiveXObject('WScript.Shell');
   if (SH == null)
   {
      WScript.StdOut.WriteLine( "Error accessing Shell handle" );
      return TmpFiles;
   }

   // Process each argument
   var i;
   var Args = WScript.Arguments;
   if (Args.Length < 2)
   {
     WScript.StdOut.WriteLine( "Insufficient number of args" );
     WScript.StdOut.WriteLine( Help );
     return TmpFiles;
   }

   // Highest value for bit mask is 0x7F(127)
   // Any invalid value causes default of 0x7F to be used
   SentenceFilterMask = WScript.Arguments( 0 );
   if ((SentenceFilterMask < 1) || (SentenceFilterMask > 127))
   {
     Txt = "Defaulting Bit Mask to 0x7F (127)"
     WScript.StdOut.WriteLine( Txt );
     SentenceFilterMask = 127;
   }

   //Construct the list of ISF files to be processed
   for (i = 1; i < Args.length; i++)
   {
      // Handle wildcards
      var Arg = WScript.Arguments( i );
      if (Arg.indexOf( '*' ) >= 0 || Arg.indexOf( '?' ) >= 0)
      {
         var LastSep = Arg.lastIndexOf( '\\' );
         var Path = LastSep >= 0 ? Arg.slice( 0, ++LastSep ) : '';

         // Let the 'dir' command do all the work
         var Cmd = 'cmd.exe /c dir /b ';
         if (bRecurse == true)
         {
            Cmd += '/s ';
         }

         var Proc = SH.Exec( Cmd + Arg );
         while (Proc.StdOut.AtEndOfStream == false)
         {
            if (bRecurse == true)
            {
               TmpFiles[TmpFiles.length] = Proc.StdOut.ReadLine();
            }
            else
            {
               TmpFiles[TmpFiles.length] = Path + Proc.StdOut.ReadLine();
            }
         }
      }
      else
      {
         TmpFiles[TmpFiles.length] = Arg;
      }
   }

   // This last step is to convert all file names to fully qualified paths,
   // it also weeds out any invalid files
   var Files = new Array();

   var FD;
   var FSO = new ActiveXObject("Scripting.FileSystemObject"); 
   if (FSO == null)
   {
      WScript.StdOut.WriteLine( "Error accessing File System handle" );
      return Files;
   }

   for (i = 0; i < TmpFiles.length; i++)
   {
      if (FSO.FileExists( TmpFiles[i] ) == true)
      {
         FD = FSO.GetFile( TmpFiles[i] );
         if (FD != null)
         {
            Files[Files.length] = FD.Path;
         }
      }
   }

   return Files;
}

// Process an item store file, stripping out NMEA sentences and sending them
// to an NMEA text file; this output text file will be named by appending
// "NMEA.txt" to the input file name
function ProcessISF( IISF, File )
{
   // Assume failure
   var RC = false;
   var Txt = "";

   Txt = "Loading ISF file:\n " + File;
   WScript.StdOut.WriteLine( Txt );

   // Load the item store file
   var Handle = IISF.LoadItemStore( File );
   if (Handle == 0xFFFFFFFF)
   {
      Txt = "Unable to load ISF:\n" + File;
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

   // Configure the client for log 0x1384
   IConfig.AddLog( 0x1384 );
   IConfig.CommitConfig();

   // Populate our client with all instances of log 0x1384
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

   // Create the output ascii file
   var NewFile = File + "NMEA.txt";
   var OutputFSO = new ActiveXObject("Scripting.FileSystemObject");
   OutputFSO.CreateTextFile( NewFile );

   var OutputFileHandle = OutputFSO.GetFile( NewFile );

   // 2 for writing, 0 for ascii
   var OutputStreamHandle = OutputFileHandle.OpenAsTextStream( 2, 0 );

   var Item;
   var ItemType;
   for (var Index = 0; Index < ItemCount; Index++)
   {
      Item = IClient.GetClientItem( ClientHandle, Index );
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
      if (FieldCount < 204)
      {
         continue;
      }

      // Each ISF sentence is an Item, which consists of Fields
      // The fields are sets of name/value pairs
      // The logic below reads in each field and looks for the "NMEA Sentence Data" field
      // An "NMEA Sentence Data" field is presented as multiple instances in the Item
      // where each instance contains one character of the NMEA sentence
      // the number of instances for a particular "NMEA Sentence Data" is described by
      // the preceding "NMEA Sentence Length" field
      // So, the logic below:
      //  1. read in Look for only "NMEA Sentence Length" and "NMEA Sentence Data" fields
      //  2. for "NMEA Sentence Length", note down the value as SentenceLength
      //  3. for "NMEA Sentence Data", accumumlate each character received until the accumulated
      //     set reaches SentenceLength
      //  4. once SentenceLength has been reached, perform filter mask processing accordingly

      var SentenceLength = 0;
      var FieldValue = Fields.GetFieldValue( 3 );
      SentenceLength = FieldValue;

      var Sentence = "";
      var SentenceCounter = 0;
      for (var FieldIndex = 4; FieldIndex < FieldCount; FieldIndex++)
      {
         FieldValue = Fields.GetFieldValue( FieldIndex );

         if (SentenceCounter < SentenceLength)
         {
            Sentence = Sentence + String.fromCharCode( FieldValue );
            SentenceCounter++;
         }
         else
         {
            var SentenceType = Sentence.substr( 1, 5 );
            switch (SentenceType)
            {
               case "GPGGA":
               if (SentenceFilterMask & 0x01)
               {
                  OutputStreamHandle.Write( Sentence );
               }
               break;

               case "GPGSA":
               if (SentenceFilterMask & 0x02)
               {
                  OutputStreamHandle.Write( Sentence );
               }
               break;

               case "GPGSV":
               if (SentenceFilterMask & 0x04)
               {
                  OutputStreamHandle.Write( Sentence );
               }
               break;

               case "GPRMC":
               if (SentenceFilterMask & 0x08)
               {
                  OutputStreamHandle.Write( Sentence );
               }
               break;

               case "GPVTG":
               if (SentenceFilterMask & 0x10)
               {
                  OutputStreamHandle.Write( Sentence );
               }
               break;

               case "PSTIP" :
               if (SentenceFilterMask & 0x20)
               {
                  OutputStreamHandle.Write( Sentence );
               }
               break;

               case "PSTII" :
               if (SentenceFilterMask & 0x40)
               {
                  OutputStreamHandle.Write( Sentence );
               }
               break;

               default:
               break;
            }

           break;

         }
      }
   }

   Txt = "Done !";
   WScript.StdOut.WriteLine( Txt );
   WScript.sleep( 1000 );

   // Now cleanup
   IClient.UnregisterClient( ClientHandle );
   OutputStreamHandle.Close();
   IISF.CloseItemStore( Handle );

   RC = true;
   return RC;
}

// Main script function
function Main()
{
   var RC = false;

   // Create the item store file interface
   var IISF = new ActiveXObject( "DMCoreAutomation.ItemStoreFiles" );
   if (IISF == null)
   {
      WScript.StdOut.WriteLine( "Unable to obtain ISF interface" );
      return RC;
   }

   // Recurse folders (applicable only to wildcard arguments)?
   var bRecurse = false;
   
   // Convert arguments to list of files
   var Files = ParseArguments( bRecurse );
   if (Files.length == 0)
   {
      WScript.StdOut.WriteLine( "No item store file(s) specified" );
      return RC;
   }

   // We will set this to false if any ISF fails
   RC = true;

   // Now process each item store file
   for (var i = 0; i < Files.length; i++)
   {
      if (ProcessISF( IISF, Files[i] ) == false)
      {
         RC = false;
      }
   }

   return RC;
}

Main();