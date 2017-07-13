// Extended format specifier script for the full parsed text of
// the Transceiver Resource Manager log (0x12E8)

// The Associative Array corresponding to the Technology Enumeration
var TechArray = new Array();
TechArray[0] = "1x";
TechArray[1] = "1x";
TechArray[2] = "HDR";
TechArray[3] = "HDR";
TechArray[4] = "GPS";

// IdentifyClient
// Display the Client Id and Technology
function IdentifyClient( Fields, InternalClientId, Technology )
{
   var Txt = "";

   Txt += "\n \nClient #";
   Txt += InternalClientId;
   Txt += " '" + Technology + "' \n";

   return Txt;
}

// CompareClientState
// Fields - Fields in the TRM Log
// InternalClientId = Id of (first) client
// Technology - The technology in the log
// Flag - 1 is the default for most versions of the log
//        2 is for the "Exchange" subcode when there are 2 clients to compare
function CompareClientState( Fields, InternalClientId, Technology, Flag )
{
   var Txt = "";
   var LoopCount = 1;

   // Starting positions from where to get the old and new state values
   var oldIndex = 4;
   var newIndex = 12;
   if (Flag == 2)
   {
      newIndex = 22;
      // If this is the "Exchange" subcode, we have two clients to compare
      LoopCount = 2;
   }

   for (var i = 0; i < LoopCount; i++)
   {
      if (i == 1)
      {
         // Handle the second client (Subcode 'Exchange')
         Txt += IdentifyClient( Fields, InternalClientId, Technology );
         oldIndex = 14;
         newIndex = 30;
      }

      var OldLockState = Fields.GetFieldValueText( oldIndex++ );
      var NewLockState = Fields.GetFieldValueText( newIndex++ );

      if (OldLockState == "Inactive" && OldLockState == NewLockState)
      {
         Txt += "  State     = " + OldLockState;
         continue;
      }

      var OldResource = Fields.GetFieldValueText( oldIndex++ );
      var NewResource = Fields.GetFieldValueText( newIndex++ );

      var OldReason = Fields.GetFieldValueText( oldIndex++ );
      var NewReason = Fields.GetFieldValueText( newIndex++ );

      var OldPriority = Fields.GetFieldValue( oldIndex++ );
      var NewPriority = Fields.GetFieldValue( newIndex++ );

      var OldChain = Fields.GetFieldValueText( oldIndex++ );
      var NewChain = Fields.GetFieldValueText( newIndex++ );

      var OldGranted = Fields.GetFieldValueText( oldIndex++ );
      var NewGranted = Fields.GetFieldValueText( newIndex++ );

      var OldGroup = Fields.GetFieldValue( oldIndex++ );
      var NewGroup = Fields.GetFieldValue( newIndex++ );

      var OldUnlockState = Fields.GetFieldValueText( oldIndex++ );
      var NewUnlockState = Fields.GetFieldValueText( newIndex++ );

      Txt += "  State        = " + OldLockState;
      if (OldLockState != NewLockState)
      {
         Txt += " -> " + NewLockState;
      }
      Txt += "\n";

      Txt += "  Resource     = " + OldResource;
      if (OldResource != NewResource)
      {
         Txt += " -> " + NewResource;
      }
      Txt += "\n";

      Txt += "  Chain        = " + OldChain;
      if (OldChain != NewChain)
      {
         Txt += " -> " + NewChain;
      }
      Txt += "\n";

      Txt += "  Reason       = " + OldReason;
      if (OldReason != NewReason)
      {
         Txt += " -> " + NewReason;
      }
      Txt += "\n";

      Txt += "  Priority     = " + OldPriority;
      if (OldPriority != NewPriority)
      {
         Txt += " -> " + NewPriority;
      }
      Txt += "\n";

      Txt += "  Group        = " + OldGroup;
      if (OldGroup != NewGroup)
      {
         Txt += " -> " + NewGroup;
      }
      Txt += "\n";

      Txt += "  Grant        = " + OldGranted;
      if (OldGranted != NewGranted)
      {
         Txt += " -> " + NewGranted;
      }
      Txt += "\n";

      Txt += "  Unlock State = " + OldUnlockState;
      if (OldUnlockState != NewUnlockState)
      {
         Txt += " -> " + NewUnlockState;
      }
      Txt += "\n";

      // Second Client Id
      InternalClientId = Fields.GetFieldValue( 12 );
      
      var ClientId = Fields.GetFieldValue( 13 );
      if (ClientId in TechArray)
      {
         Technology = TechArray[ClientId];
      }
      else
      {
         Technology = ClientId.toString();
      }
   }
   
   return Txt;
}

// DisplayDuration
// Display the duration field in the log
function DisplayDuration( Fields, InternalClientId, Technology )
{
   var Txt = "";

   Txt += "\n  Duration = ";
   Txt += Fields.GetFieldValueText ( 20 );

   return Txt;
}

// DisplayTime
// Display the time field from the log
function DisplayTime( Fields, InternalClientId, Technology )
{
   var Txt = "";

   Txt += "\n  Time     = ";
   Txt += Fields.GetFieldValueText ( 20 );

   return Txt;
}

// ExtendDuration
// Display the fields in the log for the "Extend Duration" subcode
function ExtendDuration( Fields, InternalClientId, Technology )
{
   var Txt = "";

   Txt += "\n  Req Duration      = ";
   Txt += Fields.GetFieldValueText ( 20 );
   Txt += "\n  Max Extension     = ";
   Txt += Fields.GetFieldValueText ( 21 );
   Txt += "\n  Extension Granted = ";
   Txt += Fields.GetFieldValue ( 22 );

   return Txt;
}

// ChangeDuration
// Display the fields in the log for the "Change Duration" subcode
function ChangeDuration( Fields, InternalClientId, Technology )
{
   var Txt = "";

   Txt += "\n  Min Duration  = ";
   Txt += Fields.GetFieldValueText ( 20 );
   Txt += "\n  Max Duration  = ";
   Txt += Fields.GetFieldValueText ( 21 );
   Txt += "\n  New Extension = ";
   Txt += Fields.GetFieldValueText ( 22 );
   Txt += "\n  Max Extension = ";
   Txt += Fields.GetFieldValueText ( 23 );

   return Txt;
}

// ParseToText
// The function that will return the full parsed text to QXDM
function ParseToText( Item )
{
   var Txt = "";
   var Summary = "";

   var Fields = Item.GetConfiguredItemFields( "", true, false );
   if (Fields == null)
   {
      return Summary;
   }

   var Version = Fields.GetFieldValue ( 1 );
   if (Version != 1)
   {
      // Do not parse versions we do not understand
      return Summary;
   }

   var InternalClientId = Fields.GetFieldValue( 2 );
   var ClientId = Fields.GetFieldValue( 3 );

   var Technology;
   if (ClientId in TechArray)
   {
      Technology = TechArray[ClientId];
   }
   else
   {
      Technology = ClientId.toString();
   }

   Summary += Technology + " ";
   Summary += Fields.GetFieldValueText ( 0 );
   var SubCode = Fields.GetFieldValue( 0 ); 

   Txt += Summary
   Txt += "\n";

   switch (SubCode)
   {
      // Grant Use
      case 0:     
         Txt += IdentifyClient( Fields, InternalClientId, Technology );
         Txt += CompareClientState( Fields, InternalClientId, Technology, 1 );
         break;

      // Reserve Lock
      case 1:     
         Txt += DisplayTime( Fields, InternalClientId, Technology );
         Txt += DisplayDuration( Fields, InternalClientId, Technology );
         Txt += IdentifyClient( Fields, InternalClientId, Technology );
         Txt += CompareClientState( Fields, InternalClientId, Technology, 1 );
         break;

      // Request and Notify
      case 2:     
         Txt += DisplayDuration( Fields, InternalClientId, Technology );
         Txt += IdentifyClient( Fields, InternalClientId, Technology );
         Txt += CompareClientState( Fields, InternalClientId, Technology, 1 );
         break;

      // Request Immediate
      case 3:     
         Txt += DisplayDuration( Fields, InternalClientId, Technology );
         Txt += IdentifyClient( Fields, InternalClientId, Technology );
         Txt += CompareClientState( Fields, InternalClientId, Technology, 1 );
         break;

      // Cancel Request
      case 4:     
         Txt += IdentifyClient( Fields, InternalClientId, Technology );
         Txt += CompareClientState( Fields, InternalClientId, Technology, 1 );
         break;
      
      // Release
      case 5:
         Txt += IdentifyClient( Fields, InternalClientId, Technology );
         Txt += CompareClientState( Fields, InternalClientId, Technology, 1 );
         break;
         
      // Retain Lock
      case 6:
         Txt += IdentifyClient( Fields, InternalClientId, Technology );
         Txt += CompareClientState( Fields, InternalClientId, Technology, 1 );
         break;
         
      // Change Priority
      case 7:
         Txt += IdentifyClient( Fields, InternalClientId, Technology );
         Txt += CompareClientState( Fields, InternalClientId, Technology, 1 );
         break;
         
      // Extend Duration
      case 8:
         Txt += ExtendDuration( Fields, InternalClientId, Technology );
         Txt += IdentifyClient( Fields, InternalClientId, Technology );
         Txt += CompareClientState( Fields, InternalClientId, Technology, 1 );
         break;
         
      // Change Duration
      case 9:
         Txt += ChangeDuration( Fields, InternalClientId, Technology );
         Txt += IdentifyClient( Fields, InternalClientId, Technology );
         Txt += CompareClientState( Fields, InternalClientId, Technology, 1 );
         break;
         
      // Exchange
      case 10:
         Txt += IdentifyClient( Fields, InternalClientId, Technology );
         Txt += CompareClientState( Fields, InternalClientId, Technology, 2 );
         break;
         
      // Unlock Notify
      case 11:
         Txt += DisplayDuration( Fields, InternalClientId, Technology );
         Txt += IdentifyClient( Fields, InternalClientId, Technology );
         Txt += CompareClientState( Fields, InternalClientId, Technology, 1 );
         break;
         
      default: 
         // Do not parse unknown structures
         Txt = "";
         break;
   }

   return Txt;
}
