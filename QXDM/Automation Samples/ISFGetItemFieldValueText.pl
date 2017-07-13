# NOTE: This script must be run with Perl in a command box,
# i.e.  Perl ISFGetItemFieldValueText.pl

# This script demostrates usage of the IColorItem automation
# interface method GetItemFieldValueText()

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

   my $Lat    = $Item->GetItemFieldValueText( FIELD_TYPE_FLOAT64, 64, 0, true, false );
   my $Long   = $Item->GetItemFieldValueText( FIELD_TYPE_FLOAT64, 64, 64, true, false );
   my $Alt    = $Item->GetItemFieldValueText( FIELD_TYPE_FLOAT64, 64, 128, true, false );
   my $Course = $Item->GetItemFieldValueText( FIELD_TYPE_FLOAT64, 64, 192, true, false );
   my $Speed  = $Item->GetItemFieldValueText( FIELD_TYPE_FLOAT64, 64, 256, true, false );
   my $Time   = $Item->GetItemFieldValueText( FIELD_TYPE_FLOAT64, 64, 320, true, false );
   my $Sats   = $Item->GetItemFieldValueText( FIELD_TYPE_INT32, 32, 384, true, false );
   my $Qual   = $Item->GetItemFieldValueText( FIELD_TYPE_INT32, 32, 416, true, false );

   print "\nLatitude   = " . $Lat  . "\n"
       . "Longitude  = " . $Long . "\n"
       . "Altitude   = " . $Alt . "\n"
       . "Course     = " . $Course . "\n"
       . "Speed      = " . $Speed . "\n"
       . "Time       = " . $Time . "\n"
       . "Satellites = " . $Sats . "\n"
       . "Quality    = " . $Qual . "\n";
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