// NOTE: This script must be run from CScript in a command box,
// i.e. CScript ISFPartition.js file1 file2 dir1\*.isf dir2\*.isf

// This script demonstrates partitioning "Item Store Format"(ISF) file
// into individual ISF files based on item type. An example of item type
// would be events, logs, debug messages.

// Process the arguments to create a list of files
function ParseArguments( bRecurse )
{
   var TmpFiles = new Array();

   // Grab the shell
   var SH = new ActiveXObject('WScript.Shell');
   if (SH == null)
   {
      return TmpFiles;
   }

   // Process each argument
   var i;
   var Args = WScript.Arguments;
   for (i = 0; i < Args.length; i++)
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

// Structure that defines a partition
function Partition( itemType, name )
{
   this.Name         = name;
   this.ItemType     = itemType;
   this.ClientHandle = 0xFFFFFFFF;
   this.Items        = 0;
}

// Partition ISF into individual files (by item type)
function PartitionISF( IISF, File, Partitions )
{
   // Assume failure
   var RC = false;
   var Txt = "";

   // We time this operation
   var StartTime = new Date();

   Txt = "Processing: " + File;
   WScript.StdOut.WriteLine( Txt );

   // Load the item store file
   var hISF = IISF.LoadItemStore( File );
   if (hISF == 0xFFFFFFFF)
   {
      WScript.StdOut.WriteLine( "Unable to load item store file" );
      return rc;
   }

   // Get ISF client interface
   var IClient = IISF.GetClientInterface( hISF );
   if (IClient == null)
   {
      Txt = "Unable to obtain ISF client interface";
      WScript.StdOut.WriteLine( Txt );

      IISF.CloseItemStore( hISF );
      return RC;
   }

   var P;
   var ValidPartitions = 0;

   // Initialize partition clients
   for (P in Partitions)
   {
      Partitions[P].ClientHandle = IClient.RegisterClient( false );
      if (Partitions[P].ClientHandle == 0xFFFFFFFF)
      {
         Txt = "Unable to register ISF client for " + Partitions[P].Name;
         WScript.StdOut.WriteLine( Txt );
      }

      var Cfg = IClient.ConfigureClient( Partitions[P].ClientHandle );
      if (Cfg == null)
      {
         Txt = "Unable to configure ISF client for " + Partitions[P].Name;
         WScript.StdOut.WriteLine( Txt );
      }

      // Configure the client for an item type
      Cfg.AddItem( Partitions[P].ItemType );
      Cfg.CommitConfig();

      ValidPartitions++;
   }

   if (ValidPartitions == 0)
   {
      Txt = "Unable to setup clients";
      WScript.StdOut.WriteLine( Txt );

      IISF.CloseItemStore( hISF );
      return RC;
   }

   // Populate the partitions
   IClient.PopulateClients();

   // Assume the rest will succeed
   RC = true;

   // Now copy each client contents to a new ISF
   for (P in Partitions)
   {
      if (Partitions[P].ClientHandle == 0xFFFFFFFF)
      {
         continue;
      }

      Partitions[P].Items = IClient.GetClientItemCount(
                              Partitions[P].ClientHandle );

      if (Partitions[P].Items == 0)
      {
         Txt = "No items resulted for ISF client " + Partitions[P].Name;
         WScript.StdOut.WriteLine( Txt );

         continue;
      }

      // Generate file name
      var PartitionFile = File;

      // Remove ISF extension
      var RegEx = new RegExp( "\.isf", "g" );
      PartitionFile = PartitionFile.replace( RegEx, "" );

      // Add in partition name and ISF extension
      PartitionFile += "-" + Partitions[P].Name + ".isf";

      Txt = "Saving ISF for client " + Partitions[P].Name;
      Txt += " (" + PartitionFile + ")";
      WScript.StdOut.WriteLine( Txt );

      // Copy the client contents to a new ISF
      var Tmp = IClient.CopyClientItems( Partitions[P].ClientHandle,
                                         PartitionFile,
                                         0,
                                         Partitions[P].Items - 1 );

      if (Tmp == false)
      {
         Txt = "Unable to save ISF for client " + Partitions[P].Name;
         WScript.StdOut.WriteLine( Txt );

         RC = false;
      }
   }

   // Unregister clients
   for (P in Partitions)
   {
      if (Partitions[P].ClientHandle != 0xFFFFFFFF)
      {
         IClient.UnregisterClient( Partitions[P].ClientHandle );
      }
   }

   // We timed this operation
   var EndTime = new Date();
   var Ticks = EndTime.valueOf() - StartTime.valueOf();
   if (Ticks == 0)
   {
      Ticks = 1;
   }

   var Secs = Ticks / 1000;
   WScript.StdOut.WriteLine( "Elapsed seconds " + Secs.toFixed( 2 ) );

   IISF.CloseItemStore( hISF );
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

   // Set partitions
   var Partitions = new Array();
   Partitions[0] = new Partition( 4, "Events" );
   Partitions[1] = new Partition( 5, "Logs" );
   Partitions[2] = new Partition( 6, "Messages" );

   // We will set this to false if any ISF fails
   RC = true;

   // Now process each item store file
   for (var i = 0; i < Files.length; i++)
   {
      if (PartitionISF( IISF, Files[i], Partitions ) == false)
      {
         RC = false;
      }
   }

   return RC;
}

Main();