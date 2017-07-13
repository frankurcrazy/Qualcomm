# NOTE: This script must be run from a command box, 
# i.e.  Perl QXDMLicenseDaysLeft.pl

# This script demostrates usage of the QXDM automation
# interface method LicenseDaysLeft

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

   # Get QXDM License Days Left
   my $Days = $QXDM->{LicenseDaysLeft};
   print "\nQXDM License Days Left: " . $Days . "\n";
}

Execute();