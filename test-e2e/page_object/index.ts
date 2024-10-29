import { locator } from '../../src/pageObject';

export default class App {
    SimpleTextElement = locator('#textValue');
    SimpleTextElementTemplate = locator.template(selector => selector)
    SimpleTextElementNative = locator.native(({ page }) => page.locator('#textValue'))
    SimpleTextListItemByIndex = locator.template(idx => `#textValueList li:nth-child(${idx})`);
    SimpleTextListItemByText = locator.template(text => `#textValueList li:has-text("${text}")`);
    SimpleTextListItems = locator('#textValueList li');
    SimpleTextInput = locator('#textInput');
    FileInput = locator('#fileInput');
    Action = locator('#action');
    AlertButton = locator('#confirm');
    PromptButton = locator('#prompt');
    Body = locator('body');
    Button = locator('#button');
    ButtonTap = locator('#buttonTap');
    ButtonHover = locator('#buttonHover');
    Input = locator('#input');
    Select = locator('#select');
    Buttons = locator('.button');
    IFrame = locator('iframe#firstIframe');
    InnerIFrame = locator('iframe#innerIframe');
    FrameElementInFrame = locator.native(({ page }) => page.frameLocator('iframe#innerIframe').locator('#frameElement'));
    FrameElement = locator('#frameElement');
    InnerFrameElement = locator('#innerFrameElement');
    NewTabLink = locator('#newTabLink');
    EnabledButton = locator('#enabledButton');
    DisabledButton = locator('#disabledButton');
    PresentElement = locator('#present');
    PresentCollection = locator('#present');
    DetachElement = locator('#detach');
    VisibleElement = locator('#visible');
    HiddenElement = locator('#hidden');
    InfiniteScroll = locator('#infiniteScroll');
    InfiniteScrollItem = locator.template(text => `#infiniteScroll li:has-text("${text}")`);
    Loading = locator('#loading');
    LoadingInput = locator('#loadingInput');
    WaitCollection = locator('#waitCollection > div');
    PressCounter = locator('#pressCounter');

    User = locator.template(idx => `#users > li:nth-child(${idx})`);
    OverflowContainer = locator('#overflowContainer');

    KeyDump = locator('#keywordevent');

    Cookie = locator('#cookie');
    LocalStorage = locator('#localStorage');
    SessionStorage = locator('#sessionStorage');

    DropZone = locator('div#div1');
    DragElement = locator('div#drag1');
    DragElementInDropZone = locator('div#div1 div#drag1');

    EventHandler = locator('#mouseEvent');
    KeyboardEventHandler = locator('#keyboardEvent');

    ScrollElement = locator('#scrollElement');

    // Electron
    OpenNewWindowElectronButton = locator('#electronButton');
    CloseCurrentWindowElectronButton = locator('#closeCurrentWindow');

    //JS Selector
    SimpleTextElementByJS = locator('js=document.querySelectorAll("#textValue")');
    SimpleTextListItemsByJS = locator('js=document.querySelectorAll("#textValueList li")');
    BodyComponent = locator('body').as(BodyComponent);
    BodyComponentTemplate = locator.template((selector: string) => selector).as(BodyComponent);
    BodyComponentNative = locator.native(({ page }) => page.locator('body')).as(BodyComponent);
}

class BodyComponent {
    TextElement = locator('#textValue');
}