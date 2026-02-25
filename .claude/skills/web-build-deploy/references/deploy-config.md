# Deploy Configuration

## Project
- name: MoonIdle
- source_dir: .
- entry_file: index.html

## Beta (surge.sh)
- domain: moonidle-beta.surge.sh
- command: npx surge --project . --domain moonidle-beta.surge.sh

## Live (GitHub Pages)
- remote: origin
- branch: master
- url: https://happyone7.github.io/moon-idle/
- method: git push (GitHub Pages auto-builds from branch)
