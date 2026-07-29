/**
 * The river that every Hexer fixture file starts with, so scenarios that act on
 * an existing river don't have to seed one after the editor has been built.
 * Seeding afterwards would reload the view and rebuild the editor, resetting the
 * selected layer.
 */
export const EXISTING_RIVER_ID = '00000000-0000-4000-8000-000000000001';
