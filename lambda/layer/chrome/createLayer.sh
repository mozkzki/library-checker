#!/bin/bash -eu

script_dir=$(cd $(dirname $0); pwd)

rm -f $script_dir/headless-chromium
rm -f $script_dir/chromedriver

# https://github.com/adieuadieu/serverless-chrome/issues/133

# ======================================
# パターン1
#
# severless-chrome : 1.0.0-37 (64.0.3282.167 stable channel) 
# chromedriver     : 2.37
# selenium         : 3.141.0
#
# ======================================
# Chrome (headless-chromium)
wget https://github.com/adieuadieu/serverless-chrome/releases/download/v1.0.0-37/stable-headless-chromium-amazonlinux-2017-03.zip -O stable-headless-chromium-amazonlinux.zip 
# ChromeDriver
wget -N https://chromedriver.storage.googleapis.com/2.37/chromedriver_linux64.zip -O chromedriver_linux64.zip


# ======================================
# パターン2 (この組み合わせでは動かせていない in lambda)
#
# severless-chrome : 1.0.0-55 (69.0.3497.81 stable channel) 
# chromedriver     : 2.43
# selenium         : 3.141.0
#
# ======================================
# Chrome (headless-chromium)
# wget https://github.com/adieuadieu/serverless-chrome/releases/download/v1.0.0-55/stable-headless-chromium-amazonlinux-2017-03.zip -O stable-headless-chromium-amazonlinux.zip
# ChromeDriver
# wget -N https://chromedriver.storage.googleapis.com/2.43/chromedriver_linux64.zip -O chromedriver_linux64.zip


# ======================================
# パターン3 (最新, この組み合わせでは動かせていない in lambda)
#
# severless-chrome : 1.0.0-57 (86.0.4240.111 stable channel) 
# chromedriver     : 86.0.4240.22
# selenium         : 3.141.0
#
# ======================================
# Chrome (headless-chromium)
# wget https://github.com/adieuadieu/serverless-chrome/releases/download/v1.0.0-57/stable-headless-chromium-amazonlinux-2.zip -O stable-headless-chromium-amazonlinux.zip 
# ChromeDriver
# wget -N https://chromedriver.storage.googleapis.com/86.0.4240.22/chromedriver_linux64.zip -O chromedriver_linux64.zip


# Chrome (headless-chromium)
unzip stable-headless-chromium-amazonlinux.zip -d $script_dir/
rm stable-headless-chromium-amazonlinux.zip

# ChromeDriver
unzip chromedriver_linux64.zip -d $script_dir/
rm chromedriver_linux64.zip
chmod +x $script_dir/chromedriver
