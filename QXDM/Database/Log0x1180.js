// Extended format specifier script for the full parsed text of
// the 1xEV-DO Multicast Physical Channel Metrics log (0x1180)

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
   if (MaxIndex == 0 || --MaxIndex < 64)
   {
      return Txt;
   }

   var Count = Fields.GetFieldValue( 0 );
   if (MaxIndex < (64 + (Count * 4 * 2)) || Count == 0 || Count > 16)
   {
      return Txt;
   }

   Txt += "Multiplex Count = ";
   Txt += Count;
   Txt += "\n \n";

   Txt += "(I,M)       CRC Pass     CRC Fail   CRC Fail %   Status\n";
   Txt += "-------------------------------------------------------\n";

   var fi = 65;
   var i = 0;
   var j = 0;
   var k = 0;
   for (i = 0; i < 4; i++)
   {
      Txt += " \n";

      for (j = 0; j < Count; j++)
      {
         var Pass = Fields.GetFieldValue( fi );
         var Fail = Fields.GetFieldValue( fi + 1);

         var FailPct = "-";
         if (Pass + Fail != 0)
         {
            FailPct = 100.0 * Fail / (Pass + Fail);
            FailPct = FailPct.toFixed( 4 );
         }

         var Status = "-";
         var MonitoredPairs = Fields.GetFieldValueText ( 1 + k );
         if (MonitoredPairs == 1)
         {
            Status = "Active";
         }

         Txt += PadString( "(" + i + "," + j + ")", 7, false );
         Txt += PadString( Pass, 13, true );
         Txt += PadString( Fail, 13, true );
         Txt += PadString( FailPct, 11, true );
         Txt += PadString( Status, 11, true );
         Txt += "\n";

         k++;
         fi += 2;
      }
   }

   return Txt;
}