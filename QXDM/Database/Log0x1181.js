// Extended format specifier script for the full parsed text of
// the 1xEV-DO Multicast ECB Status log (0x1181)

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
   // Force to string
   Str += "";

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
   ParseToText

DESCRIPTION:
   The function that will return the full parsed text to QXDM

PARAMETERS:
   Item     [ I ] - Item to be parsed
  
RETURN VALUE:
   String
===========================================================================*/
function ParseToText( Item )
{
   var Txt = "";

   var Fields = Item.GetConfiguredItemFields( "", true, false );
   if (Fields == null)
   {
      return Txt;
   }

   var MaxIndex = Fields.GetFieldCount();
   if (MaxIndex == 0 || --MaxIndex < 5)
   {
      return Txt;
   }
   
   var NumColumns = Fields.GetFieldValue( 3 );
   if (MaxIndex < 5 + NumColumns * 2)
   {
      return Txt;
   }   

   Txt += PadString( "Channel ID", 23, false ) + Fields.GetFieldValue( 0 ) + "\n";
   Txt += PadString( "Flow ID", 23, false ) + Fields.GetFieldValue( 1 ) + "\n";

   var OuterCode = Fields.GetFieldValueText( 2 );   
   Txt += PadString( "Outer Code", 23, false );
   Txt += OuterCode + "\n";

   var SecPktIncluded = Fields.GetFieldValue( 4 );

   Txt += PadString( "Security Pkt Included", 23, false );
   Txt += SecPktIncluded;

   if (NumColumns == 0)
   {
      return Txt;
   }
   
   Txt += "\n \n";
   Txt += PadString( "Column", 6, false );
   Txt += PadString( "Data Erasures", 17, true );
   Txt += PadString( "Total Erasures", 17, true );
   Txt += "\n----------------------------------------";
   
   var fi = 6;
   for (var i = 0; i < NumColumns; ++i)
   {
      Txt += "\n";
      Txt += PadString( i + 1, 6, false );
      Txt += PadString( Fields.GetFieldValue( fi ), 17, true );
      Txt += PadString( Fields.GetFieldValue( fi + 1 ), 17, true );
      fi += 2;
   }
   
   return Txt;
}

