// Extended format specifier script for the summary parsed text of
// the DTV Table Acquisition Failure event (1271)
function ParseToSummary( Item )
{
   var Summary = "";
   var Fields = Item.GetItemFields();
   if (Fields == null)
   {
      return Summary;
   }

   Summary = "Table: " + Fields.GetFieldValueText( 0 );

   var TableID = Fields.GetFieldValue( 0 );
   if (TableID == 0x4C)
   {
      Summary += ", Platform ID: " + Fields.GetFieldValueText( 1 );
   }
   else if (TableID == 0x02)
   {
      Summary += ", Program Number: " + Fields.GetFieldValueText( 1 );
   }

   return Summary;
}