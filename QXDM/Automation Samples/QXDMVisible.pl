# NOTE: This script must be run from a command box, 
# i.e.  Perl QXDMVisible.pl

# This script demostrates usage of the QXDM automation
# interface method Visible

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

# Dump out and change QXDM server's visibility status
sub Visible
{
   # QXDM server's visible status
   my $VisibleValue = $QXDM->{Visible};
   if ($VisibleValue == false)
   {
      print "\nQXDM is currently not visible\n"
          . "Making QXDM server visible\n";

      # Make QXDM server visible
      $QXDM->{Visible} = true;

      print "QXDM server now visible\n";

      return;
   }

   print "\nQXDM is currently visible"
       . "\nMaking QXDM server unvisible\n";

   # Make QXDM server unvisible
   $QXDM->{Visible} = false;

   # QXDM server unvisible for 5s
   sleep( 5 );

   $QXDM->{Visible} = true;

   # Make QXDM server visible
   print "QXDM server is visible again\n";
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

   # Dump out and change QXDM visibility status
   Visible();
}

Execute();