#!/bin/bash
# Install graphics libraries needed for cv2 in headless environment
apt-get update && apt-get install -y \
  libgl1-mesa-glx \
  libglib2.0-0 \
  libsm6 \
  libxext6 \
  libxrender-dev
