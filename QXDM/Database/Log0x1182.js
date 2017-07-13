// Extended format specifier script for the full parsed text of
// the 1xEV-DO Multicast Logical Channel Metrics log (0x1182)

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
   GetPercentage

DESCRIPTION:
   Gives the percentage of a value from two values

PARAMETERS:
   a        [ I ] - First value
   b        [ I ] - Second value

RETURN VALUE:
   Number
===========================================================================*/
function GetPercentage( a, b )
{
   // Return dash for invalid
   var pct = "-";

   // Ensure denominator is not zero
   if (a + b > 0)
   {
      pct = 100.0 * a / (a + b);
      pct = pct.toFixed( 4 )
   }

   return pct;
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
   if (MaxIndex == 0)
   {
      return Txt;
   }

   var ChanCount = Fields.GetFieldValue( 0 );
   if (--MaxIndex < ChanCount * 23)
   {
      return Txt;
   }

   Txt += PadString( "Channel Count = ", 18, false );
   Txt += PadString( ChanCount, 7, false );
   
   var i = 0;
   for (i = 0; i < ChanCount; i++)
   {
      Txt += "       Ch " + (i + 1);
   }

   Txt += "\n-------------------------";
   for (i = 0; i < ChanCount; i++)
   {
      Txt += "-----------";
   }
   Txt += "\n";

   var fi = 1;
   Txt += PadString( "Channel ID", 25, false );
   for (i = 0; i < ChanCount; i++)
   {
      Txt += PadString( Fields.GetFieldValue( fi ), 11, true );
      fi += 23;
   }
   Txt += "\n";

   fi = 1;
   Txt += PadString( "Flow ID", 25, false );
   for (i = 0; i < ChanCount; i++)
   {
      Txt += PadString( Fields.GetFieldValue( fi + 1 ), 11, true );
      fi += 23;
   }
   Txt += "\n";

   fi = 1;
   Txt += PadString( "MAC Packets CRC Passed", 25, false );
   for (i = 0; i < ChanCount; i++)
   {
      Txt += PadString( Fields.GetFieldValue( fi + 2 ), 11, true );
      fi += 23;
   }
   Txt += "\n";
   
   fi = 1;
   Txt += PadString( "MAC Packets CRC Failed", 25, false );
   for (i = 0; i < ChanCount; i++)
   {
      Txt += PadString( Fields.GetFieldValue( fi + 3 ), 11, true );
      fi += 23;
   }
   Txt += "\n";

   fi = 1;
   Txt += PadString( "MAC Packets CRC Failed %", 25, false );
   for (i = 0; i < ChanCount; i++)
   {
      var crcPass = Fields.GetFieldValue( fi + 2 );
      var crcFail = Fields.GetFieldValue( fi + 3 );
      var FailPct = GetPercentage( crcFail, crcPass );
      Txt += PadString( FailPct, 11, true );
      fi += 23;
   }
   Txt += "\n";

   fi = 1;
   Txt += PadString( "MAC Packets CRC Missed", 25, false );
   for (i = 0; i < ChanCount; i++)
   {
      Txt += PadString( Fields.GetFieldValue( fi + 4 ), 11, true );
      fi += 23;
   }
   Txt += "\n";

   fi = 1;
   Txt += PadString( "ECB No Erasures", 25, false );
   for (i = 0; i < ChanCount; i++)
   {
      Txt += PadString( Fields.GetFieldValue( fi + 5 ), 11, true );
      fi += 23;
   }
   Txt += "\n";

   fi = 1;
   Txt += PadString( "ECB Decode Pass", 25, false );
   for (i = 0; i < ChanCount; i++)
   {
      Txt += PadString( Fields.GetFieldValue( fi + 6 ), 11, true );
      fi += 23;
   }
   Txt += "\n";

   fi = 1;
   Txt += PadString( "ECB Decode Abort", 25, false );
   for (i = 0; i < ChanCount; i++)
   {
      Txt += PadString( Fields.GetFieldValue( fi + 7 ), 11, true );
      fi += 23;
   }
   Txt += "\n";

   fi = 1;
   Txt += PadString( "MAC Packets Delivered", 25, false );
   for (i = 0; i < ChanCount; i++)
   {
      Txt += PadString( Fields.GetFieldValue( fi + 8 ), 11, true );
      fi += 23;
   }
   Txt += "\n";

   fi = 1;
   Txt += PadString( "Security Layer Packets", 25, false );
   for (i = 0; i < ChanCount; i++)
   {
      Txt += PadString( Fields.GetFieldValue( fi + 9 ), 11, true );
      fi += 23;
   }
   Txt += "\n";

   fi = 1;
   Txt += PadString( "Security Packet Count", 25, false );
   for (i = 0; i < ChanCount; i++)
   {
      Txt += PadString( Fields.GetFieldValue( fi + 12 ), 11, true );
      fi += 23;
   }
   Txt += "\n";

   fi = 1;
   Txt += PadString( "Security Byte Count", 25, false );
   for (i = 0; i < ChanCount; i++)
   {
      Txt += PadString( Fields.GetFieldValue( fi + 13 ), 11, true );
      fi += 23;
   }
   Txt += "\n";

   fi = 1;
   Txt += PadString( "Framing Packet Count", 25, false );
   for (i = 0; i < ChanCount; i++)
   {
      Txt += PadString( Fields.GetFieldValue( fi + 16 ), 11, true );
      fi += 23;
   }
   Txt += "\n";

   fi = 1;
   Txt += PadString( "Framing Byte Count", 25, false );
   for (i = 0; i < ChanCount; i++)
   {
      Txt += PadString( Fields.GetFieldValue( fi + 17 ), 11, true );
      fi += 23;
   }
   Txt += "\n";

   fi = 1;
   Txt += PadString( "Packets Delivered", 25, false );
   for (i = 0; i < ChanCount; i++)
   {
      Txt += PadString( Fields.GetFieldValue( fi + 18 ), 11, true );
      fi += 23;
   }
   Txt += "\n";

   fi = 1;
   Txt += PadString( "Packets Dropped", 25, false );
   for (i = 0; i < ChanCount; i++)
   {
      Txt += PadString( Fields.GetFieldValue( fi + 19 ), 11, true );
      fi += 23;
   }
   Txt += "\n";

   fi = 1;
   Txt += PadString( "Bytes Delivered", 25, false );
   for (i = 0; i < ChanCount; i++)
   {
      Txt += PadString( Fields.GetFieldValue( fi + 20 ), 11, true );
      fi += 23;
   }

   return Txt;
}
