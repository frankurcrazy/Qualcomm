// DM Core Automation - Item Store Files Interface Example
// 
// This example processes one or more ISFs outputting a list of each
// kind of item present in the file as well as the number of occurences
// of that kind.  'Kind' is defined as the unique item type/item key
// pair.  As example of a 'kind' of item would be log items with 
// log code 0x4202
//
// NOTE: This script must be run from CScript in a command box, 
// i.e. CScript ISFProps.js file1 file2 dir1\*.isf dir2\*.isf


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

// Structure to keep track of a kind of item
function ItemInfo( Type, KeyText, Name )
{
   this.Count   = 1;
   this.Type    = Type;
   this.KeyText = KeyText;
   this.Name    = Name;
};

// Add spaces to a string to make it a given length
function PadString( Str, Len )
{
   for (var c = Str.length; c < Len; c++)
   {
      Str += " ";
   }
   
   return Str;
}

// Process an item store file, dumping out a count of each 'kind' of item
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
   
   // Build an array of item names
   var Names = new Array();
   
   var Item;
   var ItemType;
   var ItemName;
   var ItemKey;
   var Info;
   var CurrentPacket = 0;
   while (CurrentPacket < ItemCount)
   {
      Item = IISF.GetItem( hISF, CurrentPacket );
      if (Item != null)
      {
         ItemType = Item.GetItemTypeText();         
         ItemKey = Item.GetItemKeyText();
         ItemName = Item.GetItemName();
         
         // The type and key form a unique pair
         Txt = ItemType + ItemKey;
         if (Txt in Names)
         {
            Names[Txt].Count++;
         }
         else
         {
            Info = new ItemInfo( ItemType, ItemKey, ItemName );
            Names[Txt] = Info;
         }
      }

      CurrentPacket++;
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
   
   // Output the results
   var Kind;
   for (Kind in Names)
   {
      Info = Names[Kind];
      
      Txt = PadString( Info.Count.toString(), 10 );
      Txt += PadString( Info.Type, 12 );
      Txt += PadString( Info.KeyText, 18 );
      Txt += Info.Name;
      
      WScript.StdOut.WriteLine( Txt );
   }   
  
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
