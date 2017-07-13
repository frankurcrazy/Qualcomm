// DM Core Automation - Item Store Files Interface Example
// 
// This example processes one or more ISFs collecting statistics on dropped 
// debug trace messages.  Both the old form and the new form of debug trace 
// messages are supported.  For the old form the script attempts to reset 
// the appropriate internal variable when a new connection is encountered.  
// This is done by looking for items that are of the ‘string’ type and the 
// ‘state’ subtype and comparing their summary text to that which the DM core 
// library connection state machine produces
//
// NOTE: This script must be run from CScript in a command box, 
// i.e. CScript DroppedMsgs.js file1 file2 dir1\*.isf dir2\*.isf

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

// Process an item store file, dumping out dropped message stats
function ProcessISF( IISF, File )
{
   var rc = false;
      
   var Txt = "Processing: " + File;
   WScript.StdOut.WriteLine( Txt );
   
   // Load the item store file
   var hISF = IISF.LoadItemStore( File );
   if (hISF == 0xFFFFFFFF)
   {
     
      WScript.StdOut.WriteLine( "Unable to load item store file" );
      return rc;
   }   

   // We time this operation
   var StartTime = new Date();

   // Get number of items in item store
   var ItemCount = IISF.GetItemCount( hISF );
   
   // Constants
   var MSG_TYPE = 6;
   var STR_TYPE = 7;
   var OLD_MSG_CC = 31;
   var NEW_MSG_CC = 121
   
   // New (debug message 2.0) stats
   var NewDropInstances = 0;
   var NewDropTotal = 0;
   
   // Old (debug message 1.0) stats
   var OldDropInstances = 0;
   var OldDropTotal = 0;
   var OldBase = -1;
   
   var Item;
   var ItemType;
   var FieldVal = 0;
   var CurrentPacket = 0;
   while (CurrentPacket < ItemCount)
   {
      Item = IISF.GetItem( hISF, CurrentPacket );
      CurrentPacket++;
      
      if (Item == null)
      {
         continue;
      }
               
      // We only concern ourselves with debug messages and state strings
      ItemType = Item.GetItemType();
      if (ItemType == MSG_TYPE)
      {
         // Parse to fields
         Fields = Item.GetConfiguredItemFields( "", false, false );
         if (Fields == null)
         {
            continue;
         }
         
         // Get the command code
         FieldVal = Fields.GetFieldValue( 0 );
         if (FieldVal == OLD_MSG_CC)
         {
            // Get the drop count (third field)
            FieldVal = Fields.GetFieldValue( 2 );
            if (OldBase == -1)
            {
               OldBase = FieldVal;
            }
            
            if (FieldVal > OldBase)
            {
               // Txt = "ISF Index: " + (CurrentPacket - 1);
               // WScript.StdOut.WriteLine( Txt );
            
               OldDropInstances++;
               OldDropTotal += (FieldVal - OldBase);
            }
            
            OldBase = FieldVal;
         }
         else if (FieldVal == NEW_MSG_CC)
         {
            // Get the drop count (fourth field)
            FieldVal = Fields.GetFieldValue( 3 );
            if (FieldVal != 0)
            {
               // Txt = "ISF Index: " + (CurrentPacket - 1);
               // WScript.StdOut.WriteLine( Txt );            
            
               NewDropInstances++;
               NewDropTotal += FieldVal;
            } 
         }
      }
      else if (ItemType == STR_TYPE)
      {
         if (Item.GetItemKeyText() == "[4]")
         {
            if (Item.GetItemSummary().indexOf( "Connected to" ) >= 0)
            {
               // New connection - reset old base
               OldBase = -1;
            }
         }
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
   var IPS = ItemCount / Secs;

   Txt = "Processed " + ItemCount + " items in " + Secs.toFixed( 2 )
       + " seconds (" + IPS.toFixed( 2 ) + " items/s)";
       
   WScript.StdOut.WriteLine( Txt );

   Txt = "Drop Count: " + (OldDropInstances + NewDropInstances);
   WScript.StdOut.WriteLine( Txt );

   Txt = "Drop Total: " + (OldDropTotal + NewDropTotal);
   WScript.StdOut.WriteLine( Txt );

   WScript.StdOut.WriteLine( "" ); 
   
   rc = true;  
   return rc;
}

// Main script function
function Main()
{
   var rc = false;

   // Create the item store file interface
   var IISF = new ActiveXObject( "DMCoreAutomation.ItemStoreFiles" );
   if (IISF == null)
   {
      WScript.StdOut.WriteLine( "Unable to obtain ISF interface" );
      return rc;
   }

   // Recurse folders (applicable only to wildcard arguments)?
   var bRecurse = false;
   
   // Convert arguments to list of files
   var Files = ParseArguments( bRecurse );
   if (Files.length == 0)
   {
      WScript.StdOut.WriteLine( "No item store file(s) specified" );
      return rc;
   }

   // We will set this to false if any ISF fails
   rc = true;

   // Now process each item store file
   for (var i = 0; i < Files.length; i++)
   {
      if (ProcessISF( IISF, Files[i] ) == false)
      {
         rc = false;
      }
   }

   return rc;
}

Main();
