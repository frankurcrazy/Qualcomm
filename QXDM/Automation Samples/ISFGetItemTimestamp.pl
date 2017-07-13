# NOTE: This script must be run with Perl in a command box,
# i.e.  Perl ISFGetItemTimestamp.pl

# This script demostrates usage of the IColorItem automation
# interface methods:
#    GetItemTimestamp()
#    GetItemTimestamp2()
#    GetItemTimestampText()
#    GetItemSpecificTimestamp()
#    GetItemSpecificTimestamp2()
#    GetItemSpecificTimestampText()

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
   $FileName = $FolderPath . "Example.isf";
   return $FileName;
}

# Dump timestamp of an item
sub DumpItemTimestamp
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
   my $Item = $IISF->GetItem( $Handle, 3 );
   if ($Item == null)
   {
      print "\nUnable to retrieve item\n";
      return;
   }

   my $Timestamp = $Item->GetItemTimestamp();
   print "\nGetItemTimestamp()          = " . $Timestamp . " (Script Object)";

   $Timestamp = $Item->GetItemSpecificTimestamp();
   print "\nGetItemSpecificTimestamp()  = " . $Timestamp . " (Script Object)";

   $Timestamp = $Item->GetItemTimestamp2();
   print "\nGetItemTimestamp2()         = " . $Timestamp . " (OLE Raw)";

   $Timestamp = $Item->GetItemSpecificTimestamp2();
   print "\nGetItemSpecificTimestamp2() = " . $Timestamp . " (OLE Raw)";

   my $WantDate = true;
   my $WantMS = true;
   $Timestamp = $Item->GetItemTimestampText( $WantDate, $WantMS );
   print "\nGetItemTimestampText( " 
       . "true" . ", " .  "true" . " )           = " . $Timestamp;

   $WantDate = false;
   $WantMS = true;
   $Timestamp = $Item->GetItemTimestampText( $WantDate, $WantMS );
   print "\nGetItemTimestampText( " 
       . "false" . ", " .  "true" . " )          = " . $Timestamp;

   $WantDate = false;
   $WantMS = false;
   $Timestamp = $Item->GetItemTimestampText( $WantDate, $WantMS );
   print "\nGetItemTimestampText( " 
       . "false" . ", " .  "false" . " )         = " . $Timestamp;

   $WantDate = true;
   $WantMS = true;
   $Timestamp = $Item->GetItemSpecificTimestampText( $WantDate, $WantMS );
   print "\nGetItemSpecificTimestampText( "
       . "true" . ", " .  "true" . " )   = " . $Timestamp;

   $WantDate = false;
   $WantMS = true;
   $Timestamp = $Item->GetItemSpecificTimestampText( $WantDate, $WantMS );
   print "\nGetItemSpecificTimestampText( "
       . "false" . ", " .  "true" . " )  = " . $Timestamp;

   $WantDate = false;
   $WantMS = false;
   $Timestamp = $Item->GetItemSpecificTimestampText( $WantDate, $WantMS );
   print "\nGetItemSpecificTimestampText( " 
       . "false" . ", " .  "false" . " ) = " . $Timestamp . "\n";
}

# Main body of script
sub Execute
{
   # Launch QXDM
   my $RC = Initialize();
   if ($RC == false)
   {
      return;
   }

   # Dump timestamp of an item
   DumpItemTimestamp();
}

Execute();