# NOTE: This script must be run with Perl in a command box,
# i.e.  Perl ISFGetConfiguredItemFields.pl

# This script demostrates usage of the ColorItem automation
# interface method GetConfiguredItemFields()

use HelperFunctions;
use Benchmark qw( :hireswallclock );

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

# Test performance of GetConfiguredItemFields()
sub RunIndividualTest
{  
   my $ParsedFields = 0;
   my $Runs = 50000;

   my ( $Item, $FieldStrings, $FieldNames ) = @_;
   my $ParameterOne = ($FieldStrings == 1) ? "true" : "false";
   my $ParameterTwo = ($FieldNames == 1) ? "true" : "false";

   print "\nMeasuring GetConfiguredItemFields( \"\", "
       . $ParameterOne . ", "
       . $ParameterTwo . " ) performance";

   my $StartTime = new Benchmark;

   for (my $R = 0; $R < $Runs; $R++)
   {
      my $Fields = $Item->GetConfiguredItemFields( "",
                                                   $FieldStrings,
                                                   $FieldNames );

      if ($Fields == null)
      {
         print "\nUnable to retrieve fields for item\n";

         return $RC;
      }

      $ParsedFields += $Fields->GetFieldCount();
   }

   my $EndTime = new Benchmark;

   my $Secs = timediff( $EndTime, $StartTime );
   $Secs = timestr( $Secs, 'nop' );
   if ($Secs == 0)
   {
      $Secs = 1;
   }

   my $Rate = $Runs / $Secs;

   printf "\nProcessed $Runs items in %5.2f seconds (%5.2f items/s)",
          $Secs, $Rate;

   $Rate = $ParsedFields / $Secs;
   printf "\nProcessed $ParsedFields fields in %5.2f seconds (%5.2f fields/s)\n",
          $Secs, $Rate;
}

# Test performance of all GetConfiguredItemFields() variants
sub RunTest
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
      print "\nUnable to load ISF:\n" . $FileName;

      return;
   }

   # Retrieve item from example ISF
   my $Item = $IISF->GetItem( $Handle, 3 );
   if ($Item == null)
   {
      print "\nUnable to retrieve item\n";

      return;
   }

   RunIndividualTest( $Item, true, true );
   RunIndividualTest( $Item, false, true );
   RunIndividualTest( $Item, false, false );
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

   RunTest();
}

Execute();