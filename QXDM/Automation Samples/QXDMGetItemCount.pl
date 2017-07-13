# NOTE: This script must be run with Perl in a command box,
# i.e.  Perl QXDMGetItemCount.pl

# This example demonstrates the usage of the QXDM2 automation
# interface method GetItemCount

use HelperFunctions;

# Global variables
my $QXDM;
my $QXDM2;

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

   # Get number of items in item store
   my $ItemCount = $QXDM2->GetItemCount();

   print "Number of items in item view: $ItemCount\n";
}

Execute();