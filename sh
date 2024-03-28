#!/bin/bash

BLUE='\033[0;38;5;26;48;5;254m'
BOLD='\033[1;38;5;26;48;5;254m'
NC='\033[0m'

function print_help()
{
	printf "$BLUE Welcome to a helper tool for$BOLD Spine Event Engine$BLUE!                                        $NC\n"
    printf "$BLUE   Usage: spine.sh <command>                                                             $NC\n"
	printf "$BLUE                                                                                         $NC\n"
	printf "$BLUE Here is a list of available commands:                                                   $NC\n"
	printf "$BLUE  •$BOLD about$BLUE — a brief description of the framework,                                        $NC\n"
	printf "$BLUE  •$BOLD why$BLUE — our motivation to create Spine in the first place,                             $NC\n"
	printf "$BLUE  •$BOLD licensing$BLUE — terms of licensing,                                                      $NC\n"
	printf "$BLUE  •$BOLD releases$BLUE — information on Spine releases,                                            $NC\n"
	printf "$BLUE  •$BOLD quickstart$BLUE — git-clone our 'Hello' application.                                      $NC\n"
}

if [ -z "$1" ]
then
	print_help
else
	case $1 in
		about)
		    printf "$BLUE Spine Event Engine is open-source CQRS/Event Sourcing framework.                        $NC\n"
		    printf "$BLUE for building cloud applications DDD way.                                                $NC\n"
		;;
		why)
			printf "$BLUE Founded in$BOLD 2015$BLUE, Spine is an answer to challenges:                                      $NC\n"
			printf "$BLUE                                                                                         $NC\n"
			printf "$BLUE • Business want to get value$BOLD faster$BLUE.                                                    $NC\n"
			printf "$BLUE • We need a$BOLD common language$BLUE between business and developers.                            $NC\n"
			printf "$BLUE • Too much boilerplate code.                                                            $NC\n"
			printf "$BLUE • Existing tools$BOLD aren't enough$BLUE, as we tried many since 2010, when we first adopted DDD. $NC\n"
	    ;;
		licensing)
			printf "$BLUE Licensed under$BOLD Apache 2.0$BLUE, with commercial support.                                     $NC\n"
	    ;;
		releases)
			printf "$BLUE Latest:$BOLD 1.9.0$BLUE,                                                                          $NC\n"
			printf "$BLUE (30+ more releases).                                                                    $NC\n"
	    ;;
		quickstart)
			git --version 2>&1 >/dev/null
			GIT_IS_AVAILABLE=$?
			# ...
			if [ $GIT_IS_AVAILABLE -eq 0 ];
			then
				printf "$BLUE Cloning$BOLD 'spine-examples/hello'$BLUE into './hello'...                                        $NC\n"
				git clone https://github.com/spine-examples/hello.git
		    else
		    	printf "$BLUE $BOLD 'git'$BLUE is not available in your PATH. Please install it, and repeat the action.         $NC\n"
			fi
	    ;;

		*)
			print_help
		;;
	esac
fi
