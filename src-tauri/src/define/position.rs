use std::mem::size_of;

use serde::{Deserialize, Serialize};

use crate::racekeys::get_race_key_bytes;

use super::serialize::{EncodeBinary, Offset};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Position {
    pub sex: Sex,
    pub race: String,
    pub event: String,

    pub scale: f32,
    pub extra: Extra,
    pub offset: Offset,
    pub anim_obj: String,
    pub strip_data: Stripping,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Sex {
    male: bool,
    female: bool,
    futa: bool,
}

#[derive(Debug, Serialize, Deserialize, Clone, Default)]
pub struct Extra {
    submissive: bool,
    optional: bool,
    vampire: bool,
    climax: bool,
    dead: bool,
}

#[derive(Debug, Serialize, Deserialize, Clone, Default)]
pub struct Stripping {
    default: bool,

    everything: bool,
    nothing: bool,
    helmet: bool,
    gloves: bool,
    boots: bool,
}

impl Position {
    pub fn get_byte_size_meta(&self) -> usize {
        size_of::<u64>() + size_of::<i32>() + 3
    }

    pub fn write_byte_meta(&self, buf: &mut Vec<u8>) -> () {
        // race
        let racebyte = get_race_key_bytes(&self.race).unwrap();
        buf.push(racebyte);
        // sex
        buf.push(self.sex.male as u8 + 2 * self.sex.female as u8 + 4 * self.sex.futa as u8);
        // scale
        let s_ = (self.scale * 1000.0).round() as i32;
        buf.extend_from_slice(&s_.to_be_bytes());
        // extra
        buf.push(
            self.extra.submissive as u8
                + 2 * self.extra.optional as u8
                + 4 * self.extra.vampire as u8
                + 8 * self.extra.dead as u8,
        );
    }
}

impl EncodeBinary for Position {
    fn get_byte_size(&self) -> usize {
        self.event.len() + size_of::<u64>() + 1 + self.offset.get_byte_size()
    }

    fn write_byte(&self, buf: &mut Vec<u8>) -> () {
        // event
        buf.extend_from_slice(&(self.event.len() as u64).to_be_bytes());
        buf.extend_from_slice(self.event.as_bytes());
        // climax
        buf.push(self.extra.climax as u8);
        // offset
        self.offset.write_byte(buf);
    }
}

impl Default for Position {
    fn default() -> Self {
        Self {
            sex: Default::default(),
            race: "Human".into(),
            event: Default::default(),
            scale: 1.0,
            extra: Default::default(),
            offset: Default::default(),
            anim_obj: Default::default(),
            strip_data: Default::default(),
        }
    }
}

impl Default for Sex {
    fn default() -> Self {
        Self {
            male: true,
            female: false,
            futa: false,
        }
    }
}
