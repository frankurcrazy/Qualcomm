// Extended format specifier script for the summary parsed text of
// the DTV Table Acquisition Success event (1270)
function ParseToSummary( Item )
{
   var Summary = "";
   var Fields = Item.GetItemFields();
   if (Fields == null)
   {
      return Summary;
   }

   Summary = "Table: " + Fields.GetFieldValueText( 0 );

   var FO = 0;
   var TableID = Fields.GetFieldValue( FO++ );
   switch (TableID)
   {
      case 0x00: 
         Summary += ", TSID: " + Fields.GetFieldValueText( FO++ );
         break;
          
      case 0x02:
         Summary += ", Program Number: " + Fields.GetFieldValueText( FO++ );
         break;
         
      case 0x40:
      case 0x41:      
         Summary += ", Network ID: "  + Fields.GetFieldValueText( FO++ );
         break;
                  
      case 0x4A:
         Summary += ", Bouquet ID: "  + Fields.GetFieldValueText( FO++ );
         break;
         
      case 0x4C:
         Summary += ", Action Type: "  + Fields.GetFieldValueText( FO++ );
         FO++;
         break;           
   }
   
   Summary += ", Version Number: "+ Fields.GetFieldValueText( FO++ );
   Summary += ", Packet ID: " + Fields.GetFieldValueText( FO++ );

   if (TableID == 0x4C)
   {
      Summary += ", Platform ID: " + Fields.GetFieldValueText( FO );
   }

   return Summary;
}