import { ComponentBase, html, Tag, Page } from '../../../../core/src/component-base';

@Tag('home-page')
@Page('/')
export class HomePage extends ComponentBase {
    render() {
        return html`
        <div style="background-color: #f5f5f5">
            <h1>Model preview</h1>
            <div>
                Hellow World
            </div>
        </div>
        `;
    }
}
