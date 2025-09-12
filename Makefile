#############################
# preinstall requirements   #
# 1. install python3      	#
# 2. install python3-gi   	#
# 3. install python3-vte  	#
#############################

all: xtermng

xtermng: main.py
	cp main.py xtermng
	chmod +x xtermng

deps:
	sudo apt update && sudo apt full-upgrade -y && sudo apt install python3 python3-gi python3-vte libgtk-3-dev libnotify-bin zenity libvte-2.91-dev


install: xtermng
	mkdir -p ~/.xtermng/ ; cp -rf . ~/.xtermng/
	sudo mkdir -p /opt/xtermng/
	sudo cp main.py /opt/xtermng/main.py
	sudo chmod +x /opt/xtermng/main.py
	sudo ln -sf /opt/xtermng/main.py /bin/xtermng
	sudo cp -rf ./xdg/xtermng.desktop /usr/share/applications
	cp -rf ./xdg/xtermng.desktop ~/.local/share/applications
	sudo cp -rf ./icon/xtermng.png /usr/share/icons/hicolor/256x256/apps/
	sudo cp -rf ./icon/xtermng.png /usr/share/icons/hicolor/256x256/apps/
	sudo cp -rf ./icon/xtermng.png /usr/share/icons/

