import os, sys

_cur_dir = os.getcwd()
_entered = "/mods/"

def main():
    global _entered
    # We will be inside of the mods directory...
    _dirs = os.listdir( _cur_dir + _entered )
    for folder in _dirs:
        # We are now going to go inside each mod...
        _entered = "/mods/" + folder
        # We now need to delete the unneeded files...
        _hold_type = ""
        toDelete = ['type.txt']
        for item in toDelete:
            # We are just going to quickly take the old data out of this file...
            # and load it into memory for later.
            with open("{0}{1}/{2}".format(_cur_dir, _entered, item), 'r') as readIt:
                for line in readIt:
                    _line = line.split("\n")
                    # Takeing the line and stripping it out incase there is other lines
                    # in this file. We are the writing it to our variable in memory.
                    _hold_type = _line[0]
            # Now deleting the old file.
            os.remove("{0}{1}/{2}".format(_cur_dir, _entered, item))
        # Creating our new file.
        with open("{0}{1}/{2}".format(_cur_dir, _entered, "info.mod"), 'w') as out:
            # Writing the lines to the new file...
            out.write(folder + "\n")
            out.write("Crazywolf132\n")
            out.write(_hold_type + "\n")
# Running the main function...
main()