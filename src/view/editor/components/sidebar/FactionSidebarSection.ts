import { Faction } from "../../../../logic/faction";
import { HexerData } from "../../../../logic/HexerData";
import { ComponentOptions } from "../../Editor";
import { ItemSettings } from "../../../ObsidianInterop";
import EditorListSidebarSection, { EditorListSidebarSectionOptions } from "./EditorListSidebarSection";
import SidebarListRow from "./SidebarListRow";

export class FactionSidebarSection extends EditorListSidebarSection<Faction> {
    constructor(
        parentEl: HTMLElement,
        componentOptions: ComponentOptions,
        options: EditorListSidebarSectionOptions
    ) {
        super(parentEl, componentOptions, options);
        this.renderItems();
    }

    protected getItems(data: HexerData): Faction[] {
        return data.factions;
    }

    protected addItem(): void {
        const data = this._componentOptions.getDataClone();
        const newFaction: Faction = {
            id: crypto.randomUUID(),
            color: '#ff0000',
            name: 'New faction',
            filePath: null
        };
        data.factions.push(newFaction);
        this._componentOptions.setData(data);
        this.setActiveFaction(newFaction.id);
        this.renderItems();
    }

    protected renderRow(listEl: HTMLElement, item: Faction): void {
        const activeFactionId = this._componentOptions.getEditorState().activeFactionId;
        new SidebarListRow<Faction>(listEl, {
            disableEdit: activeFactionId !== null && activeFactionId !== item.id,
            editMode: activeFactionId === item.id,
            item,
            obsidian: this._componentOptions.obsidian,
            getId: faction => faction.id,
            getName: faction => faction.name,
            getColour: faction => faction.color,
            getFilePath: faction => faction.filePath,
            onEdit: this.editFaction.bind(this),
            onFinish: this.closeFaction.bind(this),
            onColourPicked: colour => this.saveColour(item.id, colour),
            onSettings: faction => this._componentOptions.obsidian.openItemSettings({
                settings: { name: faction.name, filePath: faction.filePath },
                onSave: settings => this.saveFactionSettings(faction.id, settings),
            }),
        });
    }

    private setActiveFaction(factionId: string | null) {
        const state = this._componentOptions.getEditorState();
        state.activeFactionId = factionId;
        this._componentOptions.setEditorState(state);
    }

    private editFaction(factionId: string) {
        this.setActiveFaction(factionId);
        this.renderItems();
    }

    private closeFaction() {
        this.setActiveFaction(null);
        this.renderItems();
    }

    private saveColour(factionId: string, colour: string) {
        const data = this._componentOptions.getDataClone();
        const target = data.factions.find(faction => faction.id === factionId);
        if(!target) {
            return;
        }

        target.color = colour;
        this._componentOptions.setData(data);
    }

    private saveFactionSettings(factionId: string, settings: ItemSettings) {
        const data = this._componentOptions.getDataClone();
        const target = data.factions.find(faction => faction.id === factionId);
        if(!target) {
            return;
        }

        target.name = settings.name;
        target.filePath = settings.filePath;

        this._componentOptions.setData(data);
        this.renderItems();
    }
}
