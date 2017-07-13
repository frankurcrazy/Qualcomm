# NOTE: This script must be run with Perl in a command box,
# i.e.  Perl ISFGetItemFieldValue.pl

# This script demostrates usage of the IColorItem automation
# interface method GetItemFieldValue()

use HelperFunctions;

# Global variable
my $IISF;

# Initialize application
sub Initialize
{
   # Assume failure
   my $RC = false;

   # Create the item store file interface
   $IISF = new Win32::OLE 'DMCoreAutomation.ItemStoreFiles';
   if (!$IISF)
   {
      print "\nUnable to obtain ISF interface\n";

      return $RC;
   }

   # Success
   $RC = true;
   return $RC;
}

# Get file name from script folder path
sub GetFileName
{
   my $FileName = "";
   my $FolderPath = GetPathFromScript();

   # Item store file name
   $FileName = $FolderPath . "GPSExample.isf";
   return $FileName;
}

# Dump the GPS item
sub DumpGPSItem
{
   # Generate item store file name
   my $FileName = GetFileName();
   if ($FileName eq "")
   {
      return;
   }

   # Load the item store file
   my $Handle = $IISF->LoadItemStore( $FileName );
   if ($Handle == 0xFFFFFFFF)
   {
      print "\nUnable to load ISF:\n$FileName\n";
      return;
   }

   # Retrieve item from example ISF
   my $Item = $IISF->GetItem( $Handle, 0 );
   if ($Item == null)
   {
      print "\nUnable to retrieve item\n";
      return;
   }

   my $Lat    = $Item->GetItemFieldValue( FIELD_TYPE_FLOAT64, 64, 0, true );
   my $Long   = $Item->GetItemFieldValue( FIELD_TYPE_FLOAT64, 64, 64, true );
   my $Alt    = $Item->GetItemFieldValue( FIELD_TYPE_FLOAT64, 64, 128, true );
   my $Course = $Item->GetItemFieldValue( FIELD_TYPE_FLOAT64, 64, 192, true );
   my $Speed  = $Item->GetItemFieldValue( FIELD_TYPE_FLOAT64, 64, 256, true );
   my $Time   = $Item->GetItemFieldValue( FIELD_TYPE_FLOAT64, 64, 320, true );
   my $Sats   = $Item->GetItemFieldValue( FIELD_TYPE_INT32, 32, 384, true );
   my $Qual   = $Item->GetItemFieldValue( FIELD_TYPE_INT32, 32, 416, true );

   printf( "\nLatitude   = %.6f", $Lat );
   printf( "\nLongitude  = %.6f", $Long );
   printf( "\nAltitude   = %.2f", $Alt );
   printf( "\nCourse     = %.2f", $Course );
   printf( "\nSpeed      = %.2f", $Speed );
   printf( "\nTime       = %.2f", $Time );
   printf( "\nSatellites = %d", $Sats );
   printf( "\nQuality    = %d\n", $Qual );
}

# Main body of script
sub Execute
{
   # Launch QXDM
   $RC = Initialize();
   if ($RC == false)
   {
      return;
   }

   # Dump the GPS item
   DumpGPSItem();
}

Execute();