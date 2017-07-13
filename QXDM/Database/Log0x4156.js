// Extended format specifier script for the full parsed text of
// the WCDMA Inter-frequency List Search log (0x4156)

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
   if (MaxIndex == 0 || --MaxIndex < 4)
   {
      return Txt;
   }

   var NumTasks = Fields.GetFieldValue( 4 );
   if (MaxIndex < 4 + NumTasks * 15)
   {
      return Txt;
   }

   var Rssi = Fields.GetFieldValue( 3 );
   Txt += "Frequency Info:\nARFCN = " + Fields.GetFieldValue( 2 );
   Txt += "\nRSSI = " + Rssi;
   Txt += " dBm\n \nCell Info:\n";
   Txt += PadString( "Scrambling code", 15, true );
   Txt += PadString( "Ec/Io (dB)", 16, true );
   Txt += PadString( "RSCP", 16, true );
   Txt += PadString( "Cell Set", 16, true );
   Txt += "\n";
   
   var fi = 5;
   for (var i = 0; i < NumTasks; i++)
   {
      var M = Fields.GetFieldValue( fi + 2 );
      var N = Fields.GetFieldValue( fi + 1 ) * 64;
      var ScCodeIdx = Fields.GetFieldValue( fi + 4 );
      var CellSet = Fields.GetFieldValueText( fi + 5 );

      fi += 7;
      for (var j = 0; j < 4; j++)
      {
         var Energy = Fields.GetFieldValue( fi + 1 );
         Energy = Math.log( (Energy - 0.1406 * M * N) / (0.1406 * M * N * N) );
         var EcIo = 10.0 * Energy * Math.LOG10E;
         var Rscp = EcIo + Rssi;

         EcIo = EcIo.toFixed( 2 );
         Rscp = Rscp.toFixed( 2 );

         Txt += PadString( ScCodeIdx, 15, true );
         Txt += PadString( EcIo, 16, true );
         Txt += PadString( Rscp, 16, true );
         Txt += PadString( CellSet, 16, true );
         Txt += "\n";

         fi += 2;
      }
   }

   return Txt;
}

