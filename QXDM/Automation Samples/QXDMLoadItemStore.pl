# NOTE: This script must be run with Perl in a command box,
# i.e.  Perl QXDMLoadItemStore.pl

# This script demostrates usage of the QXDM2 automation
# interface method LoadItemStore

use HelperFunctions;

# Global variables
my $QXDM;
my $QXDM2;

# Get file name from script folder path
sub GetFileName
{
   my $FileName = "";
   my $FolderPath = GetPathFromScript();

   # Item store file name
   $FileName = $FolderPath . "WCDMACall.isf";
   return $FileName;
}

# Initialize application
sub Initialize
{
   # Assume failure
   my $RC = false;

   # Create QXDM object
   $QXDM = new Win32::OLE 'QXDM.Application';
   if ($QXDM == null)
   {
      print "\nError launching QXDM";

      return $RC;
   }

   # Create QXDM2 interface
   $QXDM2 = $QXDM->GetIQXDM2();
   if ($QXDM2 == null)
   {
      print "\nQXDM does not support required interface";

      return $RC;
   }

   SetQXDM ( $QXDM );
   SetQXDM2 ( $QXDM2 );

   # Success
   $RC = true;
   return $RC;
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

   # Get QXDM version
   my $Version = $QXDM->{AppVersion};
   print "\nQXDM Version: " . $Version . "\n";

   # Disconnect phone in order to load item store file
   $RC = Disconnect();
   if ($RC == false)
   {
      return;
   }

   # Generate item store file name
   my $FileName = GetFileName();
   if ($FileName eq "")
   {
      return;
   }

   print "Loading item store file:\n"
       . "$FileName\n";

   # Load existing item store file
   $RC = $QXDM->LoadItemStore( $FileName );
   if ($RC == false)
   {
      print "\nUnable to load item store file\n";

      return;
   }

   print "Successfully loaded item store file\n";
}

Execute();