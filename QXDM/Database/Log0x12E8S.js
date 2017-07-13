// Extended format specifier script for the summary parsed text of
// the Transceiver Resource Manager log (0x12E8)

// The Associative Array corresponding to the Technology Enumeration
var TechArray = new Array();
TechArray[0] = "1x";
TechArray[1] = "1x";
TechArray[2] = "HDR";
TechArray[3] = "HDR";
TechArray[4] = "GPS";

// ParseToSummary
// The function that will return the summary parsed text to QXDM
function ParseToSummary( Item )
{
   var Summary = "";
   var Fields = Item.GetConfiguredItemFields( "", true, false );
   if (Fields == null)
   {
      return Summary;
   }

   var Version = Fields.GetFieldValue ( 1 );
   if (Version != 1)
   {
      return Summary;
   }

   var ClientID = Fields.GetFieldValue( 3 );
   if (ClientID in TechArray)
   {
      Summary += TechArray[ClientID];
   }
   else
   {
      Summary += ClientID.toString();
   }

   Summary += " ";
   Summary += Fields.GetFieldValueText ( 0 );

   var SubCode = Fields.GetFieldValue( 0 ); 
   if (SubCode == 0 || SubCode == 1 || SubCode == 3 || SubCode == 5) 
   {
      // Grant Use, Reserve Lock, Release or Request Immediate subcodes
      var OldGranted = Fields.GetFieldValueText( 9 );
      var NewGranted = Fields.GetFieldValueText( 17 );
      if (OldGranted != NewGranted)
      {
         if (OldGranted == "Denied")
         {
            Summary += " (Granted " + NewGranted + ")";
         }
         else if (NewGranted == "Denied")
         {
            Summary += " (Released " + OldGranted + ")";
         }
      }
   }
   else if (SubCode == 8) 
   {
      // Extend Duration
      var value = Fields.GetFieldValue( 22 );
      if (value == 1)
      {
         Summary += " (Granted)";
      }
      else
      {
         Summary += " (Failed)";
      }
   }

   return Summary;
}
