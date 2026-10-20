import {defineConfig} from '@playwright/test';
export default defineConfig({testDir:'e2e',workers:1,use:{channel:process.env['PW_CHANNEL']||'chromium',baseURL:process.env['SITE_URL']||'http://localhost:4200',viewport:{width:1440,height:1000},screenshot:'only-on-failure',trace:'retain-on-failure'},reporter:'list'});
