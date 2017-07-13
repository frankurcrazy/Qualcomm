/*===========================================================================
METHOD:
   ParseToText

DESCRIPTION:
   Returns the default full parsed (by DB) text to QXDM

PARAMETERS:
   Item     [ I ] - Item to be parsed
  
RETURN VALUE:
   String
===========================================================================*/
function ParseToText( Item )
{
   var DefName = "";
   return Item.GetDefaultItemDBParsedText( DefName );
}
