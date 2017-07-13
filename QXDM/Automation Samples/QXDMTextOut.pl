# NOTE: This script must be run from a command box,
# i.e.  Perl QXDMTextOut.pl

# This script demostrates usage of the QXDM automation
# interface method TextOut

use HelperFunctions;

# Global variable
my $QXDM;

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
   }

   SetQXDM( $QXDM );

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
   print "\nQXDM Version: " . $Version;

   my $Txt = "Test string";
   $QXDM->QXDMTextOut( $Txt );

   print "\nAdding 'Test string' to QXDM item store\n";
}

Execute();