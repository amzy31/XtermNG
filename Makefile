#############################
# preinstall requirements   #
# 1. install gjs          	#
# 2. install gir1.2-gtk-3.0	#
# 3. install gir1.2-vte-2.91	#
#############################

all: xtermng

xtermng: main.js
	cp main.js xtermng
	chmod +x xtermng

deps:
	sudo apt update && sudo apt full-upgrade -y && sudo apt install gjs gir1.2-gtk-3.0 gir1.2-vte-2.91 libgtk-3-dev libnotify-bin zenity libvte-2.91-dev


install: xtermng
	mkdir -p ~/.xtermng/ ; cp -rf . ~/.xtermng/
	sudo mkdir -p /opt/xtermng/
	sudo cp main.js /opt/xtermng/main.js
	sudo chmod +x /opt/xtermng/main.js
	sudo ln -sf /opt/xtermng/main.js /bin/xtermng
	sudo cp -rf ./xdg/xtermng.desktop /usr/share/applications
	cp -rf ./xdg/xtermng.desktop ~/.local/share/applications
	sudo cp -rf ./icon/xtermng.png /usr/share/icons/hicolor/256x256/apps/
	sudo cp -rf ./icon/xtermng.png /usr/share/icons/hicolor/256x256/apps/
	sudo cp -rf ./icon/xtermng.png /usr/share/icons/

