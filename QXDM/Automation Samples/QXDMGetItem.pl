# NOTE: This script must be run with Perl in a command box,
# i.e.  Perl QXDMGetItem.pl

# This script demostrates usage of the QXDM2 automation
# interface method GetItem

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

# Obtain and dump details of last item in the QXDM item store
sub DumpLastItem
{
   my $FeildPadding = 5;

   # Get number of items in item store
   my $ItemCount = $QXDM2->GetItemCount();
   if ($ItemCount == 0)
   {
      print "\nNo items in the QXDM item store\n";
      return;
   }

   # Get an item from the QXDM item store
   my $Item = $QXDM2->GetItem( $ItemCount - 1 );
   if ($Item == null)
   {
      print "\nGetItem failed\n";

      return;
   }

   print "\nGetItem succeeded"
       . "\nDisplaying item # " . ($ItemCount - 1) . ":\n";

   DumpItemDetails( $Item, $FieldPadding );
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

   # Dump out the last item
   DumpLastItem();
}

Execute();