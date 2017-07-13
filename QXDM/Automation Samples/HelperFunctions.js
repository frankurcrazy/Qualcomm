/*===========================================================================
FILE: 
   HelperFunctions.js

DESCRIPTION:
   Implementation of functions used in various automation script samples.

Copyright (C) 2006 QUALCOMM Incorporated. All rights reserved.
                   QUALCOMM Proprietary/GTDR

All data and information contained in or disclosed by this document is
confidential and proprietary information of QUALCOMM Incorporated and all
rights therein are expressly reserved.  By accepting this material the
recipient agrees that this material and the information contained therein
is held in confidence and in trust and will not be used, copied, reproduced
in whole or in part, nor its contents revealed in any manner to others
without the express written permission of QUALCOMM Incorporated.
===========================================================================*/

//---------------------------------------------------------------------------
// Definitions
//---------------------------------------------------------------------------

// Item type constants
var ITEM_TYPE_DIAG_ERR  = 0;
var ITEM_TYPE_DIAG_RX   = 1;
var ITEM_TYPE_DIAG_TX   = 2;
var ITEM_TYPE_GPS       = 3;
var ITEM_TYPE_EVENT     = 4;
var ITEM_TYPE_LOG       = 5;
var ITEM_TYPE_MESSAGE   = 6;
var ITEM_TYPE_STRING    = 7;
var ITEM_TYPE_OTA_LOG   = 8;
var ITEM_TYPE_SUBSYS_RX = 9;
var ITEM_TYPE_SUBSYS_TX = 10;

// DIAG server states
var SERVER_DISCONNECTED  = 0;
var SERVER_PRECONNECT    = 1;
var SERVER_CONNECTED     = 2;
var SERVER_PREDISCONNECT = 3;
var SERVER_PLAYBACK      = 4;

// Field type constants
var FIELD_TYPE_BOOL       = 0;
var FIELD_TYPE_INT8       = 1;
var FIELD_TYPE_UINT8      = 2;
var FIELD_TYPE_INT16      = 3;
var FIELD_TYPE_UINT16     = 4;
var FIELD_TYPE_INT32      = 5;
var FIELD_TYPE_UINT32     = 6;
var FIELD_TYPE_INT64      = 7;
var FIELD_TYPE_UINT64     = 8;
var FIELD_TYPE_STRING_A   = 9;
var FIELD_TYPE_STRING_U   = 10;
var FIELD_TYPE_STRING_ANT = 11;
var FIELD_TYPE_STRING_UNT = 12;
var FIELD_TYPE_FLOAT32    = 13;
var FIELD_TYPE_FLOAT64    = 14;

// IQXDM/IQXDM2 interfaces used by function in this file (SetQXDM/SetQXDM2
// must be called prior to using any function in this file that requires
// each interface)
var IQXDM = null;
var IQXDM2 = null;

//---------------------------------------------------------------------------
// Functions
//---------------------------------------------------------------------------

/*===========================================================================
METHOD:
   SetQXDM

DESCRIPTION:
   Set IQXDM interface object being used

PARAMETERS:
   QXDM       [ I ] - QXDM interface object to use

RETURN VALUE:
   None
===========================================================================*/
function SetQXDM( QXDM )
{
   IQXDM = QXDM;
}

/*===========================================================================
METHOD:
   SetQXDM2

DESCRIPTION:
   Set IQXDM2 interface object being used

PARAMETERS:
   QXDM2       [ I ] - QXDM2 interface object to use

RETURN VALUE:
   None
===========================================================================*/
function SetQXDM2( QXDM2 )
{
   IQXDM2 = QXDM2;
}

/*===========================================================================
METHOD:
   GetPathFromScript

DESCRIPTION:
   Get path from current script file name

RETURN VALUE:
   String ("" upon error)
===========================================================================*/
function GetPathFromScript()
{
   // Assume failure
   var Path = "";
   var Txt = "";

   var Shell = WScript.CreateObject( "WScript.Shell" );
   if (Shell == null)
   {
      Txt = "Unable to interact with Windows shell";
      WScript.StdOut.WriteLine( Txt );

      return Path;
   }

   var FilePath = WScript.ScriptFullName;
   if (FilePath.length <= 0)
   {
      Txt = "Unable to obtain script file name";
      WScript.StdOut.WriteLine( Txt );

      return Path;
   }

   var FSO = new ActiveXObject( "Scripting.FileSystemObject" );
   if (FSO == null)
   {
      Txt = "Unable to get file system object";
      WScript.StdOut.WriteLine( Txt );

      return Path;
   }

   Path = FSO.GetParentFolderName( FilePath );
   if (Path == "")
   {
      Txt = "Unable to get folder name";
      WScript.StdOut.WriteLine( Txt );
   }
   else
   {
      var LastSep = Path.lastIndexOf( "\\" );
      if (LastSep != Path.length - 1)
      {
         Path += "\\";
      }
   }

   return Path;
}

/*===========================================================================
METHOD:
   GenerateFileName

DESCRIPTION:
   Generate a unique file name

PARAMETERS:
   Path        [ I ] - Path to use ("" means use script path)
   Extension   [ I ] - Desired file extension (leading "." must be included)

RETURN VALUE:
   String ("" upon error)
===========================================================================*/
function GenerateFileName( Path, Extension )
{
   var FileName = "";
   if (Path == "")
   {
      // Use script path
      Path = GetPathFromScript();
   }
   
   var LastSep = Path.lastIndexOf( "\\" );
   if (LastSep != Path.length - 1)
   {
      Path += "\\";
   }

   var TodaysDate = new Date();
   TodaysDate = TodaysDate.toUTCString();

   var RE = new RegExp( ":", "g" );
   TodaysDate = TodaysDate.replace( RE, "." );

   RE = new RegExp( " ", "g" );
   TodaysDate = TodaysDate.replace( RE, "_" );

   RE = new RegExp( "\,", "g" );
   TodaysDate = TodaysDate.replace( RE, "" );

   FileName = Path + TodaysDate + Extension;
   return FileName;
}

/*===========================================================================
METHOD:
   PadString

DESCRIPTION:
   Add spaces to the beginning (or end) of a string to make it a given length

PARAMETERS:
   Str         [ I ] - String to pad
   Len         [ I ] - Desired string length (original length + pad)
   bLeading    [ I ] - Add space to beginning?

RETURN VALUE:
   String
===========================================================================*/
function PadString( Str, Len, bLeading )
{
   var PadString = "";
   for (var c = Str.length; c < Len; c++)
   {
      PadString += " ";
   }

   if (bLeading == true)
   {
      Str = PadString + Str;
   }
   else
   {
      Str = Str + PadString;
   }

   return Str;
}

/*===========================================================================
METHOD:
   DumpItemDetails

DESCRIPTION:
   Dump out item details for the given item

PARAMETERS:
   Item        [ I ] - Item to dump out details for
   NamePadding [ I ] - Pad field name output length to X characters

RETURN VALUE:
   None (Text written to StdOut)
===========================================================================*/
function DumpItemDetails( Item, NamePadding )
{
   if (Item == null)
   {
      return;
   }

   var ItemTS =  Item.GetItemSpecificTimestampText( false, true );
   var ItemKey = Item.GetItemKeyText();
   var ItemName = Item.GetItemName();

   var Txt = ItemTS + " " + ItemKey + " " + ItemName;
   WScript.StdOut.WriteLine( Txt );

   var ItemFields = Item.GetItemFields();
   if (ItemFields != null)
   {
      var FieldCount = ItemFields.GetFieldCount();
      for (var f = 0; f < FieldCount; f++)
      {
         var Name = ItemFields.GetFieldName( f, true );
         var Value = ItemFields.GetFieldValueText( f );

         Txt = "   ";
         Txt += PadString( Name, NamePadding, false );
         Txt += " = ";
         Txt += Value;
         WScript.StdOut.WriteLine( Txt );
      }
   }
}

/*===========================================================================
METHOD:
   Connect

DESCRIPTION:
   Connect to the given port, waiting for the connection come up

   NOTE: Requires IQXDM be set via SetQXDM() call

PARAMETERS:
   Port        [ I ] - Port to connect to (1, 2, 3, etc.)

RETURN VALUE:
   bool
===========================================================================*/
function Connect( Port )
{
   // Assume failure
   var RC = false;
   var Txt = "";

   if (Port == 0)
   {
      Txt = "Invalid COM port specified" + Port;
      WScript.StdOut.WriteLine( Txt );

      return RC;
   }

   // Connect to our desired COM port
   IQXDM.COMPort = Port;

   // Wait until DIAG server state transitions to connected
   // (we do this for up to five seconds)
   var WaitCount = 0;
   var ServerState = SERVER_DISCONNECTED;
   while (ServerState != SERVER_CONNECTED && WaitCount < 5)
   {
      WScript.sleep( 1000 );

      ServerState = IQXDM2.GetServerState();
      WaitCount++;
   }

   if (ServerState == SERVER_CONNECTED)
   {
      // Success!
      Txt = "QXDM connected to COM" + Port;
      WScript.StdOut.WriteLine( Txt );
      RC = true;
   }
   else
   {
      Txt = "QXDM unable to connect to COM" + Port;
      WScript.StdOut.WriteLine( Txt );
   }

   return RC;
}

/*===========================================================================
METHOD:
   Disconnect

DESCRIPTION:
   Disconnect, waiting for the action to complete

   NOTE: Requires IQXDM be set via SetQXDM() call

RETURN VALUE:
   bool
===========================================================================*/
function Disconnect()
{
   // Assume failure
   var RC = false;

   // Disconnect
   IQXDM.COMPort = 0;

   // Wait until DIAG server state transitions to disconnected
   // (we do this for up to five seconds)
   var WaitCount = 0;
   var ServerState = SERVER_CONNECTED;
   while (ServerState != SERVER_DISCONNECTED && WaitCount < 5)
   {
      WScript.sleep( 1000 );

      ServerState = IQXDM2.GetServerState();
      WaitCount++;
   }

   var Txt = "";
   if (ServerState == SERVER_DISCONNECTED)
   {
      // Success!
      Txt = "QXDM successfully disconnected";
      WScript.StdOut.WriteLine( Txt );
      RC = true;
   }
   else
   {
      Txt = "QXDM unable to disconnect";
      WScript.StdOut.WriteLine( Txt );
   }

   return RC;
}

/*===========================================================================
METHOD:
   GetSubsysV2ErrorCode

DESCRIPTION:
   Return the error code from a subsystem dispatch V2 response

PARAMETERS:
   Item        [ I ] - Item to extract error code from

RETURN VALUE:
   Error code (as per the standard 0 means no error)
===========================================================================*/
function GetSubsysV2ErrorCode( Item )
{
   var RC = 0;
   if (Item == null)
   {
      return RC;
   }

   var ItemKey = Item.GetItemKeyText();
   var ItemType = Item.GetItemType();
   if (ItemType == ITEM_TYPE_SUBSYS_RX)
   {
      if (ItemKey == "[128]")
      {
         // Parse out the status (UINT32, 32 bits, from bit offset [header] 32)
         RC = Item.GetItemFieldValue( FIELD_TYPE_UINT32, 32, 32, true );
      }
   }

   return RC;
}

/*===========================================================================
METHOD:
   IsErrorResponse

DESCRIPTION:
   Is the item an error response?

PARAMETERS:
   Item        [ I ] - Item to check

RETURN VALUE:
   bool
===========================================================================*/
function IsErrorResponse( Item )
{
   var RC = false;

   if (Item == null)
   {
      return RC;
   }

   var ItemKey = Item.GetItemKeyText();
   var ItemType = Item.GetItemType();
   if (ItemType == ITEM_TYPE_DIAG_RX)
   {
      switch (ItemKey)
      {
         case "[019]":
         case "[020]":
         case "[021]":
         case "[022]":
         case "[023]":
         case "[024]":
         case "[066]":
         case "[071]":
            RC = true;
            break;
            
         case "[038]":
         case "[039]":
            // NV read/write - parse out status
            var NVStatus = Item.GetItemFieldValue( FIELD_TYPE_UINT16, 
                                                   16, 
                                                   1048, 
                                                   true );
                                                   
            if (NVStatus != 0)
            {
               RC = true;
            }
            break;               
      }
   }
   else if (ItemType == ITEM_TYPE_SUBSYS_RX)
   {
      var Status = GetSubsysV2ErrorCode( Item );
      if (Status != 0)
      {
         RC = true;
      }
   }

   return RC;
}

/*===========================================================================
METHOD:
   SendRequestAndReturnResponse

DESCRIPTION:
   Send a request/wait for and return the response

   NOTE: Requires IQXDM2 be set via SetQXDM2() call

PARAMETERS:
   RequestName [ I ] - DIAG entity name of the request
   RequestArgs [ I ] - Arguments used to populate the request (may be "")
   DumpItems   [ I ] - Dump out item details to StdOut?  If so then set 
                       this to the field name factor, if not then set to
                       zero

RETURN VALUE:
   The response item (null upon error)
===========================================================================*/
function SendRequestAndReturnResponse( RequestName, RequestArgs, DumpItems )
{
   var Txt = "";

   // We need to be connected
   var ServerState = IQXDM2.GetServerState();
   if (ServerState != 2)
   {
      Txt = "Unable to send request - " + RequestName;
      WScript.StdOut.WriteLine( Txt );
      return null; 
   }

   // Create a client
   var ReqHandle = IQXDM2.RegisterQueueClient( 256 );
   if (ReqHandle == 0xFFFFFFFF)
   {
      Txt = "Unable to create client to send request - " + RequestName;
      WScript.StdOut.WriteLine( Txt );

      return null;
   }

   // One request with a 1s timeout
   var ReqID = IQXDM2.ClientRequestItem( ReqHandle,
                                         RequestName,
                                         RequestArgs,
                                         1,
                                         1000,
                                         1,
                                         1 );

   if (ReqID == 0)
   {
      Txt = "Unable to schedule request - " + RequestName;
      WScript.StdOut.WriteLine( Txt );

      IQXDM2.UnregisterClient( ReqHandle );
      return null;
   }

   var Secs = 0;
   var Items = 0;

   // Wait for the response (we know the response has arrived when the number
   // of items in our client goes to two)
   for (Secs = 0; Secs < 5; Secs++)
   {
      // Sleep for 1s
      WScript.sleep( 1000 );

      // How many items do we have?
      Items = IQXDM2.GetClientItemCount( ReqHandle );
      if (Items == 2)
      {
         break;
      }
   }

   // Dump out everything in the client?
   if (DumpItems > 0)
   {
      for (var Index = 0; Index < Items; Index++)
      {
         var Item = IQXDM2.GetClientItem( ReqHandle, Index );
         if (Item != null)
         {
            DumpItemDetails( Item, DumpItems );
         }
      }
   }

   if (Items == 2)
   {
      var Item = IQXDM2.GetClientItem( ReqHandle, 1 );
      if (IsErrorResponse( Item ) == false)
      {
         IQXDM2.UnregisterClient( ReqHandle );
         return Item;
      }
      else
      {
         Txt = "Error response received - " + Item.GetItemName();
         var Status = GetSubsysV2ErrorCode( Item );
         if (Status != 0)
         {
            Txt += " [" + Status + "]";
         }

         WScript.StdOut.WriteLine( Txt );
         
         IQXDM2.UnregisterClient( ReqHandle );
         return null;
      }
   }
   else if (Items == 1)
   {
      Txt = "Timeout waiting for response to request - " + RequestName;
      WScript.StdOut.WriteLine( Txt );

      IQXDM2.UnregisterClient( ReqHandle );
      return null;
   }

   Txt = "Error sending request - " + RequestName;
   WScript.StdOut.WriteLine( Txt );

   IQXDM2.UnregisterClient( ReqHandle );
   return null;
}

/*===========================================================================
METHOD:
   PhoneOffline

DESCRIPTION:
   Set phone offline

   NOTE: Requires IQXDM be set via SetQXDM() call

RETURN VALUE:
   bool
===========================================================================*/
function PhoneOffline()
{
   // Assume failure
   var RC = false;

   WScript.StdOut.Write( "Set phone offline ... " );

   // We need to be connected for this to work
   var ServerState = QXDM2.GetServerState();
   if (ServerState != SERVER_CONNECTED)
   {
      WScript.StdOut.WriteLine( "failed (not connected)" );
      return RC;
   }

   var Status = QXDM.OfflineDigital();
   if (Status == 1)
   {
      WScript.StdOut.WriteLine( "succeeded" );
      RC = true;
   }
   else
   {
      WScript.StdOut.WriteLine( "failed" );
   }

   return RC;
}

/*===========================================================================
METHOD:
   ResetPhone

DESCRIPTION:
   Attempt to reset the phone and wait for it to come back up

   NOTE: Requires IQXDM/IQXDM2 be set via SetQXDM/SetQXDM2() call

RETURN VALUE:
   bool
===========================================================================*/
function ResetPhone()
{
   // Assume failure
   var RC = false;
   var Txt = "";

   WScript.StdOut.Write( "Reset phone ... " );

   // We need to be connected for this to work
   var ServerState = QXDM2.GetServerState();
   if (ServerState != SERVER_CONNECTED)
   {
      WScript.StdOut.WriteLine( "failed (not connected)" );
      return RC;
   }

   // Reset the phone
   var Status = QXDM.ResetPhone();
   if (Status == 1)
   {
      WScript.StdOut.WriteLine( "succeeded" );
      RC = true;
   }
   else
   {
      WScript.StdOut.WriteLine( "failed" );
      return RC;
   }

   WScript.StdOut.Write( "Waiting for phone to restart ... " );

   // The phone should first disconnect
   var WaitCount = 0;
   ServerState = SERVER_CONNECTED;
   while (ServerState != SERVER_DISCONNECTED && WaitCount < 5)
   {
      WScript.sleep( 1000 );

      ServerState = QXDM2.GetServerState();
      WaitCount++;
   }

   if (ServerState != SERVER_DISCONNECTED)
   {
      WScript.StdOut.WriteLine( "failed" );
      return RC;
   }

   // Now wait until DIAG server state transitions back to connected
   // (we do this for up to twenty seconds)
   WaitCount = 0;
   ServerState = SERVER_DISCONNECTED;
   while (ServerState != SERVER_CONNECTED && WaitCount < 20)
   {
      WScript.sleep( 1000 );

      ServerState = QXDM2.GetServerState();
      WaitCount++;
   }

   if (ServerState == SERVER_CONNECTED)
   {
      Txt = "succeeded";
      WScript.StdOut.WriteLine( Txt );
      RC = true;
   }
   else
   {
      Txt = "failed";
      WScript.StdOut.WriteLine( Txt );
   }

   return RC;
}