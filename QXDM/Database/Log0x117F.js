// Extended format specifier script for the full parsed text of
// the 1xEV-DO Multicast Packet Rate Metricslog (0x117F)

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
   }

   return pct;
}

/*===========================================================================
METHOD:
   WritePacketRateInfo

DESCRIPTION:
   Output helper for packet rate info

PARAMETERS:
   Label       [ I ] - Label
   GoodCrc     [ I ] - Good CRC value
   BadCrc      [ I ] - Bad CRC value

RETURN VALUE:
   String
===========================================================================*/
function WritePacketRateInfo( 
   Label, 
   GoodCrc, 
   BadCrc )
{
   var Txt = "\n";
   Txt += PadString( Label, 14, false );
   Txt += PadString( GoodCrc, 11, true );
   Txt += PadString( BadCrc, 11, true );
   Txt += PadString( (GoodCrc + BadCrc), 11, true );

   var BadPct = GetPercentage( BadCrc, GoodCrc );
   if (isNaN( BadPct ) == false)
   {
      BadPct = BadPct.toFixed( 4 );
   }
   
   Txt += PadString( BadPct, 11, true );
   return Txt;
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
   if (MaxIndex == 0 || --MaxIndex < 81)
   {
      return Txt;
   }
   
   var GoodCcCrcCnt = 0, BadCcCrcCnt = 0;
   var GoodBcCrcCnt = 0, BadBcCrcCnt = 0;
   var GoodCrc = 0, BadCrc = 0;

   // Print column headers
   Txt += PadString( "Rate", 14, false );
   Txt += PadString( "Good CRC ", 11, true );
   Txt += PadString( "Bad CRC", 11, true );
   Txt += PadString( "Total", 11, true );
   Txt += PadString( "Bad CRC %", 11, true );

   var Idx;
   for (Idx = 0; Idx < 8; Idx++)
   {
      Txt += "      Slot" + (Idx + 1); 
   }
   
   Txt += "\n--------------";
   for (Idx = 0; Idx < 12; Idx++)
   {
      Txt += "-----------";
   }

   // BC 38.4k CRC and Slot Info
   GoodCrc = Fields.GetFieldValue( 4 );
   BadCrc  = Fields.GetFieldValue( 5 );
   
   Txt += WritePacketRateInfo( "BC 38.4k", GoodCrc, BadCrc );

   GoodBcCrcCnt += GoodCrc;
   BadBcCrcCnt  += BadCrc;

   var fi = 32;

   // 16 slots: 2 groups of 8
   for (Idx = 0; Idx < 8; Idx++)
   {
      Txt += PadString( Fields.GetFieldValue( fi + Idx ), 11, true );
   }

   Txt += "\n";
   Txt += PadString( "", 14, true );
   for (Idx = 0; Idx < 4; Idx++)
   {
      Txt += PadString( "", 11, true );
   }   

   for (Idx = 8; Idx < 16; Idx++)
   {
      Txt += PadString( Fields.GetFieldValue( fi + Idx ), 11, true );
   }   
   fi += 16;

   // BC 76.8k CRC and Slot Info
   GoodCrc = Fields.GetFieldValue( 6 );
   BadCrc  = Fields.GetFieldValue( 7 );
   Txt += WritePacketRateInfo( "BC 76.8k", GoodCrc, BadCrc );

   GoodBcCrcCnt += GoodCrc;
   BadBcCrcCnt  += BadCrc;

   for (Idx = 0; Idx < 8; Idx++)
   {
      Txt += PadString( Fields.GetFieldValue( fi + Idx ), 11, true );
   }
   fi += 8;
   
   // BC 153.6k CRC and Slot Info
   GoodCrc = Fields.GetFieldValue( 8 );
   BadCrc  = Fields.GetFieldValue( 9 );
   Txt += WritePacketRateInfo( "BC 153.6k", GoodCrc, BadCrc );

   GoodBcCrcCnt += GoodCrc;
   BadBcCrcCnt  += BadCrc;

   for (Idx = 0; Idx < 4; Idx++)
   {
      Txt += PadString( Fields.GetFieldValue( fi + Idx ), 11, true );
   }
   fi += 4;

   // BC 204.8k CRC and Slot Info
   GoodCrc = Fields.GetFieldValue( 10 );
   BadCrc  = Fields.GetFieldValue( 11 );
   Txt += WritePacketRateInfo( "BC 204.8k", GoodCrc, BadCrc );

   GoodBcCrcCnt += GoodCrc;
   BadBcCrcCnt  += BadCrc;

   for (Idx = 0; Idx < 3; Idx++)
   {
      Txt += PadString( Fields.GetFieldValue( fi + Idx ), 11, true );
   }
   fi += 3;

   // BC 307.2k short CRC and Slot Info
   GoodCrc = Fields.GetFieldValue( 12 );
   BadCrc  = Fields.GetFieldValue( 13 );
   Txt += WritePacketRateInfo( "BC 307.2k (S)", GoodCrc, BadCrc );

   GoodBcCrcCnt += GoodCrc;
   BadBcCrcCnt  += BadCrc;

   for (Idx = 0; Idx < 2; Idx++)
   {
      Txt += PadString( Fields.GetFieldValue( fi + Idx ), 11, true );
   }
   fi += 2;

   // BC 307.2k long CRC and Slot Info   
   GoodCrc = Fields.GetFieldValue( 14 );
   BadCrc  = Fields.GetFieldValue( 15 );
   Txt += WritePacketRateInfo( "BC 307.2k (L)", GoodCrc, BadCrc );

   GoodBcCrcCnt += GoodCrc;
   BadBcCrcCnt  += BadCrc;

   for (Idx = 0; Idx < 4; Idx++)
   {  
      Txt += PadString( Fields.GetFieldValue( fi + Idx ), 11, true );
   }
   fi += 4;

   // BC 409.6k CRC and Slot Info
   GoodCrc = Fields.GetFieldValue( 16 );
   BadCrc  = Fields.GetFieldValue( 17 );
   Txt += WritePacketRateInfo( "BC 409.6k", GoodCrc, BadCrc );

   GoodBcCrcCnt += GoodCrc;
   BadBcCrcCnt  += BadCrc;

   for (Idx = 0; Idx < 3; Idx++)
   {
      Txt += PadString( Fields.GetFieldValue( fi + Idx ), 11, true );
   }
   fi += 3;

   // BC 614.4k short CRC and Slot Info 
   GoodCrc = Fields.GetFieldValue( 18 );
   BadCrc  = Fields.GetFieldValue( 19 );
   Txt += WritePacketRateInfo( "BC 614.4k (S)", GoodCrc, BadCrc );

   GoodBcCrcCnt += GoodCrc;
   BadBcCrcCnt  += BadCrc;

   Txt += PadString( Fields.GetFieldValue( fi ), 11, true );
   fi++;

   // BC 614.4k long CRC and Slot Info 
   GoodCrc = Fields.GetFieldValue( 20 );
   BadCrc  = Fields.GetFieldValue( 21 );
   Txt += WritePacketRateInfo( "BC 614.4k (L)", GoodCrc, BadCrc );

   GoodBcCrcCnt += GoodCrc;
   BadBcCrcCnt  += BadCrc;

   for (Idx = 0; Idx < 2; Idx++)
   {
      Txt += PadString( Fields.GetFieldValue( fi + Idx ), 11, true );
   }
   fi += 2;

   // BC 921.6k CRC and Slot Info 
   GoodCrc = Fields.GetFieldValue( 22 );
   BadCrc  = Fields.GetFieldValue( 23 );   
   Txt += WritePacketRateInfo( "BC 921.6k", GoodCrc, BadCrc );

   GoodBcCrcCnt += GoodCrc;
   BadBcCrcCnt  += BadCrc;

   for (Idx = 0; Idx < 2; Idx++)
   {
      Txt += PadString( Fields.GetFieldValue( fi + Idx ), 11, true );
   }
   fi += 2;

   // BC 1228.8k short CRC and Slot Info 
   GoodCrc = Fields.GetFieldValue( 24 );
   BadCrc  = Fields.GetFieldValue( 25 );
   Txt += WritePacketRateInfo( "BC 1228.8k (S)", GoodCrc, BadCrc );

   GoodBcCrcCnt += GoodCrc;
   BadBcCrcCnt  += BadCrc;

   Txt += PadString( Fields.GetFieldValue( fi ), 11, true );
   fi++;
   
   // BC 1228.8k long CRC and Slot Info 
   GoodCrc = Fields.GetFieldValue( 26 );
   BadCrc  = Fields.GetFieldValue( 27 );
   Txt += WritePacketRateInfo( "BC 1228.8k (L)", GoodCrc, BadCrc );

   GoodBcCrcCnt += GoodCrc;
   BadBcCrcCnt  += BadCrc;

   for (Idx = 0; Idx < 2; Idx++)
   {
      Txt += PadString( Fields.GetFieldValue( fi + Idx ), 11, true );
   }
   fi += 2;

   // BC 1843.2k CRC and Slot Info 
   GoodCrc = Fields.GetFieldValue( 28 );
   BadCrc  = Fields.GetFieldValue( 29 );
   Txt += WritePacketRateInfo( "BC 1843.2k", GoodCrc, BadCrc );

   GoodBcCrcCnt += GoodCrc;
   BadBcCrcCnt  += BadCrc;

   Txt += PadString( Fields.GetFieldValue( fi ), 11, true );
   fi++;

   // BC 2457.6k CRC and Slot Info 
   GoodCrc = Fields.GetFieldValue( 30 );
   BadCrc  = Fields.GetFieldValue( 31 );
   Txt += WritePacketRateInfo( "BC 2457.6k", GoodCrc, BadCrc );

   GoodBcCrcCnt += GoodCrc;
   BadBcCrcCnt  += BadCrc;

   Txt += PadString( Fields.GetFieldValue( fi ), 11, true );
   fi++;

   // CC 38.4k CRC 
   GoodCrc = Fields.GetFieldValue( 0 );
   BadCrc  = Fields.GetFieldValue( 1 );
   Txt += WritePacketRateInfo( "CC 38.4k", GoodCrc, BadCrc );
   
   GoodCcCrcCnt += GoodCrc;
   BadCcCrcCnt  += BadCrc;

   // CC 76.8k CRC 
   GoodCrc = Fields.GetFieldValue( 2 );
   BadCrc  = Fields.GetFieldValue( 3 );
   Txt += WritePacketRateInfo( "CC 76.8k", GoodCrc, BadCrc );
   
   GoodCcCrcCnt += GoodCrc;
   BadCcCrcCnt  += BadCrc;

   Txt += "\n--------------";
   for (Idx = 0; Idx < 12; Idx++)
   {
      Txt += "-----------";
   }

   Txt += "\n";
   Txt += PadString( "Total BC", 14, false );
   Txt += PadString( GoodBcCrcCnt, 11, true );
   Txt += PadString( BadBcCrcCnt, 11, true );
   Txt += PadString( GoodBcCrcCnt + BadBcCrcCnt, 11, true );

   Txt += "\n";
   Txt += PadString( "Total CC", 14, false );
   Txt += PadString( GoodCcCrcCnt, 11, true );
   Txt += PadString( BadCcCrcCnt, 11, true );
   Txt += PadString( GoodCcCrcCnt + BadCcCrcCnt, 11, true );

   return Txt;
}
