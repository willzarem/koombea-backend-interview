import { Controller, Get, Param, Render } from '@nestjs/common';

@Controller()
export class ClientController {
  @Get('')
  @Render('login')
  renderIndex() {
    return;
  }
  @Get('scrapes')
  @Render('scrapes')
  renderScrapes() {
    return;
  }
  @Get('scrapes/:id')
  @Render('scrape-detail')
  renderScrapeDetail(@Param('id') id: string) {
    return { id };
  }
}
