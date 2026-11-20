import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch
from pipeline import posting_kit as kit


class PostingTests(unittest.TestCase):
    def test_rejects_long_or_empty_copy_without_truncating(self):
        for caption in ('', 'A' * 221):
            with self.assertRaises(ValueError):
                kit.check_caption(caption, '')

    def test_caption_target_and_hashtag_limit(self):
        text = 'A' * 120
        self.assertEqual(kit.check_caption(text, '#Delta #Airlines #Miles'), [])
        with self.assertRaises(ValueError):
            kit.check_caption(text, '#one #two #three #four')
        self.assertTrue(kit.check_caption('A concise question?', ''))

    def test_ambiguous_number_does_not_select_first_series(self):
        with tempfile.TemporaryDirectory() as folder, patch.object(kit, 'ROOT', folder):
            for name in ('map', 'money'):
                p = Path(folder, 'public', 'episodes', name)
                p.mkdir(parents=True)
                (p / 'episode.json').write_text('{"id":"' + name + '","episode":1}')
            with self.assertRaises(ValueError):
                kit.resolve('1')

    def test_alias_headings_and_inline_hashtags(self):
        s = kit.sections('## Instagram / TikTok caption\nA fact.\n\n#Delta #Miles\n## Pinned comment\nSource preserved.')
        caption, tags = kit.caption_from(s)
        self.assertEqual(caption, 'A fact.')
        self.assertEqual(tags, '#Delta #Miles')

    def test_registry_identity_and_credits_survive(self):
        s = {'caption': 'A' * 120, 'pinned comment': 'Credit: Someone, CC BY. https://example.org/license'}
        out = kit.build_kit({'id': 'demo', 'episode': 5, 'title': 'Title', 'seriesId': 'receipts'}, s)
        self.assertIn('RECEIPTS', out)
        self.assertNotIn('REDRAWN', out)
        self.assertIn(s['pinned comment'], out)


if __name__ == '__main__':
    unittest.main()
